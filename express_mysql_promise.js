const db = require("../config");

// Find All Banners
exports.getAllBannerService = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM banners", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

// Add A Banner
exports.postBannerServices = (data) => {
  return new Promise((resolve, reject) => {
    db.query("INSERT INTO banners SET ?", data, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: result.insertId, ...data });
    });
  });
};

// Update a Banner
exports.updateBannerServices = (data) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE banners SET ? WHERE id = ?",
      [data, data._id],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (result.affectedRows === 0) {
          reject({ message: "Banner not found" });
          return;
        }
        resolve({ id: data._id, ...data });
      }
    );
  });
};

// Delete a Banner
exports.deleteBannerServices = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM banners WHERE id = ?", id, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result.affectedRows === 0) {
        reject({ message: "Banner not found" });
        return;
      }
      resolve({ message: "Banner deleted successfully" });
    });
  });
};
