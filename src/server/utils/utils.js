function mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
        return callback(key, object[key]);
    });
}

module.exports.ab2str = function(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
};

module.exports.mapObject = mapObject;
