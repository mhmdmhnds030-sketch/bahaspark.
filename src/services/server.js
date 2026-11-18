import express from 'express';
import cors from 'cors';
import sql from 'mssql/msnodesqlv8.js';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=.\\SQLEXPRESS;Database=BahaaSparkDB;Trusted_Connection=yes;',
};

app.post('/api/login', async function (req, res) {
    const username = (req.body.username || '').trim();
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.NVarChar(100), username)
            .query('INSERT INTO STUDENT (USERNAME) OUTPUT INSERTED.ID, INSERTED.USERNAME, INSERTED.LOGIN_USER, INSERTED.LOGIN_TIME VALUES (@username)');

        res.json({ success: true, record: result.recordset.at(0) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, function () {
    console.log('SQL Server Login API running on http://localhost:5000');
});
