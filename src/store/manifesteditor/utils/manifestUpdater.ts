// import editJsonFile from 'edit-json-file';

export default class ManifestUpdater {

  static save(path, jsonPath, data, callback) {
    try {
      // let file = editJsonFile(path);
      if (data.constructor === Object) {
        // file.set(jsonPath, undefined);
      }
      // file.set(jsonPath, data);
      // file.save();
      callback({ status: 200, err: null });
    } catch (err) {
      callback({ status: 500, err: err });
    }
  }

}