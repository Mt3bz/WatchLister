
// get home page

exports.home = function(req, res) {
    const currentPage = 1; // Replace with the actual current page value
    res.render("index", { flash: req.flash("success")[0], currentPage: currentPage });
  };



// login
exports.login = async (req, res) => {
    try {
      res.render("login", { flash: req.flash("error")[0] });
    } catch (err) {
      // Handle any errors that occur during rendering
      console.error("Error rendering login page:", err);
      // Respond with an error page or redirect to an error route
      res.status(500).send("Internal Server Error");
    }
  };


// register
exports.register = async (req, res) => {
  try {
    res.render("register", { flash: req.flash("error")[0] }); // Pass the first error message
  } catch (err) {
    console.error("Error rendering register page:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.homepage = function(req, res) {
  res.render("home");
};
