const die = ex => {
  if (ex) {
    console.error(ex.message);
  }

  process.exit(-1);
};

module.exports = die;
