const getDate = function () {
  const today = new Date();

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };

  return today.toLocaleDateString('ru-RU', options);
};

const getDay = function () {
  const today = new Date();

  const options = {
    weekday: 'long',
  };

  return today.toLocaleDateString('ru-RU', options);
};

module.exports = {
  getDate,
  getDay,
};
