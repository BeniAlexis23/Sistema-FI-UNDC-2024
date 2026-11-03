import Category from '../models/category.model.js';
import Notice from '../models/notice.model.js';
import { slugify } from '../libs/slug.js';

const serializeCategory = (category, count) => ({
    _id: category._id,
    name: category.name,
    slug: category.slug,
    order: category.order,
    ...(count !== undefined && { count })
});

const sortedCategories = () => Category.find().sort({ order: 1, name: 1 }).lean();

/* Lista pública: alimenta los filtros del portal */
export const getCategorias = async (req, res) => {
    const categories = await sortedCategories();
    return res.json(categories.map((category) => serializeCategory(category)));
};

/* Lista del panel: incluye cuántas noticias usa cada categoría */
export const getCategories = async (req, res) => {
    const [categories, usage] = await Promise.all([
        sortedCategories(),
        Notice.aggregate([
            { $match: { category: { $ne: null } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
    ]);
    const counts = new Map(usage.map(({ _id, count }) => [String(_id), count]));
    return res.json(categories.map((category) => serializeCategory(category, counts.get(String(category._id)) ?? 0)));
};

export const createCategory = async (req, res) => {
    const { name } = req.body;
    const slug = slugify(name);
    if (!slug) return res.status(400).json(['Category name is not valid']);

    const duplicate = await Category.exists({ $or: [{ name }, { slug }] });
    if (duplicate) return res.status(409).json({ message: 'Category already exists' });

    const category = await Category.create({ name, slug, order: await Category.countDocuments() });
    return res.status(201).json(serializeCategory(category.toObject(), 0));
};

export const updateCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (req.body.name !== undefined) {
        const slug = slugify(req.body.name);
        if (!slug) return res.status(400).json(['Category name is not valid']);

        const duplicate = await Category.exists({
            _id: { $ne: category._id },
            $or: [{ name: req.body.name }, { slug }]
        });
        if (duplicate) return res.status(409).json({ message: 'Category already exists' });

        category.name = req.body.name;
        category.slug = slug;
    }
    if (req.body.order !== undefined) category.order = req.body.order;

    await category.save();
    return res.json(serializeCategory(category.toObject()));
};

export const deleteCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (await Notice.exists({ category: category._id })) {
        return res.status(409).json({ message: 'Category is in use' });
    }

    await category.deleteOne();
    return res.sendStatus(204);
};
