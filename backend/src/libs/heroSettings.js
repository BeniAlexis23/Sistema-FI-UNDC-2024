import SiteSetting from '../models/siteSetting.model.js';

const HERO_KEY = 'hero';
export const HERO_DEFAULTS = { includeFeatured: false, intervalSeconds: 6 };

export const getHeroSettings = async () => {
    const setting = await SiteSetting.findOne({ key: HERO_KEY }).lean();
    return { ...HERO_DEFAULTS, ...(setting?.value ?? {}) };
};

/* Solo se guardan las claves recibidas; el resto conserva su valor */
export const saveHeroSettings = async (changes) => {
    const $set = Object.fromEntries(Object.entries(changes).map(([name, value]) => [`value.${name}`, value]));
    await SiteSetting.findOneAndUpdate({ key: HERO_KEY }, { $set }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return getHeroSettings();
};
