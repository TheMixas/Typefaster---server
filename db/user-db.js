import {pool} from "./database.js";
/*
* <h2>Function: getUserByUsername</h2>
<p>This function is part of the user database operations. It fetches a user from the database using their username.</p>

<h3>Parameters:</h3>
<ul>
  <li><b>username:</b> The username of the user to fetch.</li>
  <li><b>selection (optional):</b> Specifies which columns to fetch. Defaults to all columns ("*"). This should never be user input to prevent SQL injection.</li>
</ul>

<h3>Operation:</h3>
<p>The function executes a SQL query using the mysql2 package, which automatically escapes query values to prevent SQL injection. It returns the user with the specified username, or undefined if no such user exists.</p>

<h3>Typical Use:</h3>
<p>This function is typically used in the authentication process to fetch user details from the database.</p>
* */
export const getUserByUsername = async (username, selection="*") => {
    const [rows, fields] = await pool.execute(`SELECT ${selection} FROM users WHERE username = ?`, [username]);
    return rows[0];
}
/*<h2>Function: getUserByEmail</h2>
<p>This function is part of the user database operations. It fetches a user from the database using their email.</p>

<h3>Parameters:</h3>
<ul>
  <li><b>email:</b> The email of the user to fetch.</li>
  <li><b>selection (optional):</b> Specifies which columns to fetch. Defaults to all columns ("*"). This should never be user input to prevent SQL injection.</li>
</ul>

<h3>Operation:</h3>
<p>The function executes a SQL query using the mysql2 package, which automatically escapes query values to prevent SQL injection. It returns the user with the specified email, or undefined if no such user exists.</p>

<h3>Typical Use:</h3>
<p>This function is typically used in the authentication process to fetch user details from the database.</p>*/
export const getUserByEmail = async (email, selection="*") => {
    const [rows, fields] = await pool.execute(`SELECT ${selection} FROM users WHERE email = ?`, [email]);
    return rows[0];
}
/*
* <h2>Function: createUser</h2>
<p>This function is part of the user database operations. It creates a new user in the database with the provided username, email, and password.</p>

<h3>Parameters:</h3>
<ul>
  <li><b>username:</b> The username of the user to create.</li>
  <li><b>email:</b> The email of the user to create.</li>
  <li><b>password:</b> The password of the user to create.</li>
</ul>

<h3>Operation:</h3>
<p>The function executes a SQL query using the mysql2 package, which automatically escapes query values to prevent SQL injection. It inserts a new row into the users table with the provided username, email, and password, and returns the ID of the newly created user.</p>

<h3>Typical Use:</h3>
<p>This function is typically used in the registration process to create a new user in the database.</p>*/
export const createUser = async (username,email, password) => {
    const [result] = await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    return result.insertId;
}