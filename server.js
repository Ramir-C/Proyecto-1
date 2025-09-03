const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

// Endpoint que recibe respuestas y las guarda
app.post('/save', async (req,res)=>{
  try{
    const { username, age, group, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers } = req.body;
    if(!username || !age || !group || !school) return res.status(400).json({ error: 'Faltan campos' });

    const result = await pool.query(
      `INSERT INTO respuestas (username, age, grupo, escuela, correct_count, incorrect_count, correct_answers, incorrect_answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, username, correct_count, incorrect_count, created_at`,
      [username, age, group, school, correctCount, incorrectCount, JSON.stringify(correctAnswers||[]), JSON.stringify(incorrectAnswers||[])]
    );
    res.json(result.rows[0]);
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Error en servidor' });
  }
});

// Página para ver resultados (docente)
app.get('/resultados', async (req,res)=>{
  try{
    const result = await pool.query('SELECT id, username, age, grupo, escuela, correct_count, incorrect_count, created_at FROM respuestas ORDER BY created_at DESC LIMIT 500');
    let html = `<html><head><meta charset="utf-8"><title>Resultados</title>
      <style>body{font-family:Arial, sans-serif; padding:20px;} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ccc;padding:6px;text-align:left}</style>
      </head><body><h1>Resultados</h1><table><thead><tr><th>ID</th><th>Usuario</th><th>Edad</th><th>Grupo</th><th>Escuela</th><th>Correctas</th><th>Incorrectas</th><th>Fecha</th></tr></thead><tbody>`;
    result.rows.forEach(r=>{
      html += `<tr><td>${r.id}</td><td>${r.username}</td><td>${r.age}</td><td>${r.grupo}</td><td>${r.escuela}</td><td>${r.correct_count}</td><td>${r.incorrect_count}</td><td>${r.created_at}</td></tr>`;
    });
    html += `</tbody></table></body></html>`;
    res.send(html);
  }catch(e){
    console.error(e);
    res.status(500).send('Error obteniendo resultados');
  }
});

app.listen(PORT, ()=>console.log('Servidor escuchando en http://localhost:'+PORT));
