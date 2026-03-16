export const CATEGORIES = [
  { id: 'breakfast',   label: 'Frühstück / Brunch',       emoji: '☕', color: '#F59E0B' },
  { id: 'party',       label: 'Secret Party Location',    emoji: '🎉', color: '#8B5CF6' },
  { id: 'lostplace',   label: 'Lost Place / Urbex',       emoji: '🏚️', color: '#6B7280' },
  { id: 'nature',      label: 'Naturspot',                emoji: '🌿', color: '#10B981' },
  { id: 'viewpoint',   label: 'Aussichtspunkt',           emoji: '🌅', color: '#F97316' },
  { id: 'restaurant',  label: 'Restaurant Geheimtipp',    emoji: '🍜', color: '#EF4444' },
  { id: 'bar',         label: 'Bar / Nachtleben',         emoji: '🍺', color: '#3B82F6' },
  { id: 'art',         label: 'Kunst / Graffiti',         emoji: '🎨', color: '#EC4899' },
  { id: 'skate',       label: 'Skate / Sport',            emoji: '🛹', color: '#14B8A6' },
  { id: 'secret_sex',  label: 'Spicy Spots',               emoji: '�', color: '#DC2626' },
  { id: 'misc',        label: 'Sonstiges',                emoji: '📍', color: '#64748B' },
];

export const getCategoryById = (id) => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryColor = (id) => {
  const category = getCategoryById(id);
  return category ? category.color : '#64748B';
};
