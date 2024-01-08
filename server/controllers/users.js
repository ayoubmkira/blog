import { User } from "../models/users.js";

export const renderRegisterForm = (req, res) => {
    res.render("users/register");
};

export const registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        // Login When Registering:
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to our Blog Website.");
            res.redirect("/posts");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/register");
    }
};

export const renderLoginForm = (req, res) => {
    res.render("users/login");
};

export const loginUser = (req, res) => {
    req.flash("success", "Welcome back to our Blog.");
    const redirectUrl = res.locals.returnTo || "/posts";
    res.redirect(redirectUrl);
};

export const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/posts');
    });
};