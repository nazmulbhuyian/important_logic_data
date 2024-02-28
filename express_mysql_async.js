const db = require("../config");

// Find All Banners
exports.getAllBannerService = async () => {
  try {
    const rows = await db.query("SELECT * FROM banners");
    return rows;
  } catch (err) {
    throw err;
  }
};

// Add A Banner
exports.postBannerServices = async (data) => {
  try {
    const result = await db.query("INSERT INTO banners SET ?", data);
    return { id: result.insertId, ...data };
  } catch (err) {
    throw err;
  }
};

// Update a Banner
exports.updateBannerServices = async (data) => {
  try {
    const result = await db.query("UPDATE banners SET ? WHERE id = ?", [
      data,
      data._id,
    ]);
    if (result.affectedRows === 0) {
      throw { message: "Banner not found" };
    }
    return { id: data._id, ...data };
  } catch (err) {
    throw err;
  }
};

// Delete a Banner
exports.deleteBannerServices = async (id) => {
  try {
    const result = await db.query("DELETE FROM banners WHERE id = ?", id);
    if (result.affectedRows === 0) {
      throw { message: "Banner not found" };
    }
    return { message: "Banner deleted successfully" };
  } catch (err) {
    throw err;
  }
};


// Get a specific Banner by its insertedId
exports.getBannerById = async (insertedId) => {
    try {
        const rows = await db.query('SELECT * FROM banners WHERE id = ?', insertedId);
        if (rows.length === 0) {
            throw { message: 'Banner not found' };
        }
        return rows[0];
    } catch (err) {
        throw err;
    }
};
