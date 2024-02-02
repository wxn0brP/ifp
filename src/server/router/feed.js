module.exports = async (req, res) => {
    const { data, user } = req.body;
    if(!user || !data) return res.send("user & data is required");

    let userI = await global.db.data.findOne("user", { _id: user.id });
    if(!userI) return res.send("Login data !");
    userI = userI.o;

    let rToken = await global.db.data.findOne("token", { token: user.rToken });
    if(!rToken) return res.send("Login data !");
    rToken = rToken.o.data.user;

    if(rToken.name != user.from || rToken._id != user.id) return res.send("Login data !");

    await global.db.data.add("feed", {
        data,
        email: userI.email
    });

    res.send("Dziękuje za przesłanie opini.");
}