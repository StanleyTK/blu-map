const User = require("../models/User");
const ProfileTrip = require("../models/ProfileTrip");
const {
  generateFromEmail,
  generateUsername,
} = require("unique-username-generator");

const UserController = {
  // Method to get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: [
          "userId",
          "userName",
          "email",
          "age",
          "gender",
          "isSuspended",
          "isDarkMode",
          "isAdmin",
          "isPublic",
        ],
      });
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getAllUsernames(req, res) {
    try {
      const users = await User.findAll({
        attributes: ["userName"],
      });
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  // Method to get a user by userId
  async getUserByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (req.user.sub !== userId) {
        return res.status(403).json({ error: "User not authorized" });
      }
      const user = await User.findOne({
        where: { userId },
        attributes: [
          "userId",
          "userName",
          "email",
          "age",
          "gender",
          "isSuspended",
          "isDarkMode",
          "isAdmin",
          "isPublic",
          "profileName",
        ],
      });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async getUserByUsername(req, res) {
    try {
      const { userName } = req.params;
      const user = await User.findOne({
        where: { userName },
        attributes: ["userName", "age", "gender", "profileName"],
      });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async getUserThemeByUserId(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({
        where: { userId },
        attributes: ["isDarkMode"],
      });
      if (user) {
        res.status(200).json({ isDarkMode: user.isDarkMode });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async createUser(req, res) {
    try {
      const { sub: userId, email } = req.user;

      const userName = generateUsername("", 3);

      if (!userId || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await User.create({
        userId,
        email,
        userName,
      });

      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async deleteUserByUserId(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.destroy({
        where: { userId },
      });
      if (user) {
        res.status(200).json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async toggleUserAdminStatusById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ where: { userId } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.isAdmin = !user.isAdmin;
      await user.save();

      res.status(200).json({
        message: `User has been ${
          user.isAdmin ? "granted admin rights" : "revoked admin rights"
        } successfully.`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async toggleUserDarkModeById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ where: { userId } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.isDarkMode = !user.isDarkMode;
      await user.save();

      res.status(200).json({
        message: `User is now in ${
          user.isDarkMode ? "Dark Mode" : "Light Mode"
        }`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async toggleUserSuspensionById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ where: { userId } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isSuspended = !user.isSuspended;
      await user.save();

      res.status(200).json({
        message: `User ${
          user.isSuspended ? "suspended" : "unsuspended"
        } successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async updateUserByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (req.user.sub !== userId) {
        return res.status(403).json({ error: "User not authorized" });
      }
      const { userNameNew, genderNew, ageNew, profileNameNew } = req.body;
      const user = await User.findOne({ where: { userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.userName = userNameNew || user.userName;
      user.gender = genderNew || user.gender;
      user.age = parseInt(ageNew) || user.age;
      user.profileName = profileNameNew || user.profileName;
      await user.save();
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async toggleUserPublicById(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ where: { userId } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isPublic = !user.isPublic;
      await user.save();

      res.status(200).json({
        message: `User mode changed to ${
          user.isPublic ? "public" : "private"
        } successfully`,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async updateUserThemeByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (req.user.sub !== userId) {
        return res.status(403).json({ error: "User not authorized" });
      }
      const { newTheme } = req.body;
      const user = await User.findOne({ where: { userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.isDarkMode = newTheme === "dark" ? true : false;
      await user.save();
      res.status(200).json({ message: "User theme updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async updateUserModeByUserId(req, res) {
    try {
      const { userId } = req.params;
      const { isPublic } = req.body;

      const user = await User.findOne({ where: { userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.isPublic = isPublic;
      await user.save();

      const profiles = await ProfileTrip.findAll({ where: { userId } });
      if (profiles.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      await Promise.all(
        profiles.map(async (profile) => {
          profile.isPublic = isPublic;
          await profile.save();
        })
      );

      res.status(200).json({ message: "User mode updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = UserController;
