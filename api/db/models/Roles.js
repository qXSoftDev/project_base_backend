const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");


const schema = mongoose.Schema({
    role_name: {type: String, required: true, unique:true},
    is_active: {type: Boolean, default: true},
    created_by: { 
        type: mongoose.SchemaTypes.ObjectId
        
    }


},{
    versionKey: false,
    timestamps:{
        createdAt: "created_at",
        updateAt: "updated_at"
    }
});


class Roles extends mongoose.Model {

    static async deleteOne(query) {
        // _id string ise ObjectId'ye çevir
        if (query._id && typeof query._id === 'string') {
            query._id = new mongoose.Types.ObjectId(query._id);
        }

        // Önce privileges'ları sil (role_id olarak query._id'yi kullan)
        await RolePrivileges.deleteMany({ role_id: query._id });

        // Sonra role'ü sil
        return await super.deleteOne(query);
    }

    static async deleteMany(query) {
        // _id string ise ObjectId'ye çevir
        if (query._id && typeof query._id === 'string') {
            query._id = new mongoose.Types.ObjectId(query._id);
        }

        // Silinecek rollerin ID'lerini bul
        const rolesToDelete = await this.find(query).select('_id');
        const roleIds = rolesToDelete.map(role => role._id);

        if (roleIds.length > 0) {
            // İlgili privileges'ları sil
            await RolePrivileges.deleteMany({
                role_id: { $in: roleIds }
            });
        }

        // Rolleri sil
        return await super.deleteMany(query);
    }

}

schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema);