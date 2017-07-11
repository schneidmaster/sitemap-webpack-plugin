export default () => {
  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const date = new Date().toLocaleDateString([], dateOptions).split('/');
  const year = date.splice(-1)[0];
  date.splice(0, 0, year);
  return date.join('-');
};
