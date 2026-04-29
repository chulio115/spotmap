export const CATEGORIES = [
  { id: 'breakfast',   label: 'Frühstück / Brunch',       emoji: '☕', color: '#F59E0B' },
  { id: 'party',       label: 'Secret Party Location',    emoji: '🎉', color: '#8B5CF6' },
  { id: 'lostplace',   label: 'Lost Place / Urbex',       emoji: '🏚️', color: '#6B7280' },
  { id: 'nature',      label: 'Naturspot',                emoji: '🌿', color: '#10B981' },
  { id: 'viewpoint',   label: 'Aussichtspunkt',           emoji: '🌅', color: '#F97316' },
  { id: 'restaurant',  label: 'Restaurant Geheimtipp',    emoji: '🍜', color: '#EF4444' },
  { id: 'bar',         label: 'Bar / Nachtleben',         emoji: '🍺', color: '#3B82F6' },
  { id: 'art',         label: 'Kunst / Graffiti',         emoji: '🎨', color: '#EC4899' },
  { id: 'skate',       label: 'Sport',                   emoji: '🏃', color: '#14B8A6' },
  { id: 'fishing',     label: 'Angel Location',           emoji: '🎣', color: '#0891B2' },
  { id: 'secret_sex',  label: 'Spicy Spots',               emoji: '🔞', color: '#DC2626' },
  { id: 'misc',        label: 'Sonstiges',                emoji: '📍', color: '#64748B' },
  { id: 'beach',       label: 'Beach / Wasser',           emoji: '🏖️', color: '#06B6D4' },
  { id: 'sunset',      label: 'Sunset Spot',              emoji: '🌇', color: '#FB923C' },
  { id: 'cafe',        label: 'Hidden Cafe',              emoji: '☕', color: '#D97706' },
  { id: 'chill',       label: 'Chill Spot',               emoji: '🛋️', color: '#818CF8' },
  { id: 'date',        label: 'Date Night Spot',          emoji: '💑', color: '#F472B6' },
  { id: 'gaming',      label: 'Gaming Spot',              emoji: '🎮', color: '#A78BFA' },
  { id: 'photo',       label: 'Photography Spot',         emoji: '📸', color: '#FBBF24' },
  { id: 'music',       label: 'Live Music / Konzerte',    emoji: '🎵', color: '#EC4899' },
  { id: 'camping',     label: 'Camping / Glamping',       emoji: '🏕️', color: '#059669' },
  { id: 'hiking',      label: 'Wanderweg / Hiking',       emoji: '🌲', color: '#65A30D' },
  { id: 'picnic',      label: 'Picknick Spot',            emoji: '⛺', color: '#84CC16' },
  { id: 'streetfood',  label: 'Street Food',              emoji: '🍕', color: '#F97316' },
  { id: 'winebar',     label: 'Weinbar / Tasting',         emoji: '🍷', color: '#9333EA' },
];

export const getCategoryById = (id) => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryColor = (id) => {
  const category = getCategoryById(id);
  return category ? category.color : '#64748B';
};
