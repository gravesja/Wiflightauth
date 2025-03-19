
export default function handler(req, res) {
    if (req.method === "POST") {
        const { auth_user, auth_pass } = req.body;

        if (auth_user === "admin" && auth_pass === "admin") {
            return res.status(200).json({ success: true, redirect: "/landingzone.html" });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials. Try again." });
        }
    }

    res.status(405).json({ message: "Method Not Allowed" });
}
