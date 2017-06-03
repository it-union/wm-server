var pool = require('mysql').createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wm_server',
    connectionLimit: 100
});
exports.query = function (sql, props) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            connection.query(
                sql, props,
                function (err, res) {
                    if (err) reject(err);
                    else resolve(res);
                }
            );
            connection.release();
        });
    });
};
