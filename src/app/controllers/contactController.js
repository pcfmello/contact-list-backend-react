const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Contact = require("../models/contact");
const PhoneNumber = require("../models/phoneNumber");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.userId })
      .sort({ name: 1 })
      .select({ name: 1 });
    return res.send({ contacts });
  } catch (error) {
    return res.status(400).send({ Error: "Error loading contacts" });
  }
});

router.get("/:contactId", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId)
      .select({ name: 1, cpf: 1, phoneNumbers: 1 })
      .populate({ path: "phoneNumbers", select: "number" });
    return res.send({ contact });
  } catch (error) {
    return res.status(400).send({ Error: "Error loading contact" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, cpf, phoneNumbers } = req.body;

    const contact = await Contact.create({
      name,
      cpf,
      user: req.userId
    });

    await Promise.all(
      phoneNumbers.map(async phone => {
        const contactPhoneNumber = new PhoneNumber({
          ...phone,
          assignedTo: contact.user._id,
          contact: contact._id
        });

        await contactPhoneNumber.save();
        contact.phoneNumbers.push(contactPhoneNumber);
      })
    );

    await contact.save();
    return res.status(201).send({ Message: "Contact saved" });
  } catch (err) {
    return res.status(400).send({ Error: "Error creating new projetct" });
  }
});

router.put("/:contactId", async (req, res) => {
  try {
    const { name, cpf, phoneNumbers } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.contactId,
      {
        name,
        cpf
      },
      { new: true }
    );

    contact.phoneNumbers = [];
    await PhoneNumber.remove({ contact: contact._id });

    await Promise.all(
      phoneNumbers.map(async phone => {
        const contactPhoneNumber = new PhoneNumber({
          ...phone,
          assignedTo: contact.user._id,
          contact: contact._id
        });

        await contactPhoneNumber.save();
        contact.phoneNumbers.push(contactPhoneNumber);
      })
    );

    await contact.save();
    return res.status(200).send({ Message: "Contact updated" });
  } catch (err) {
    return res.status(400).send({ Error: "Error updating new projetct" });
  }
});

router.delete("/:contactId", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    await PhoneNumber.remove({ contact: contact._id });
    await Contact.deleteOne(contact);

    return res.status(200).send({ Message: "Contact deleted" });
  } catch (err) {
    return res.status(400).send({ Error: "Error deleting new projetct" });
  }
});

module.exports = app => app.use("/contacts", router);
