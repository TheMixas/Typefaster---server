import {pool} from "./database.js";

export const GetProfile = async (username) => {
  console.log("GetProfile called with username: ", username)
  const query = `
    SELECT
      u.id,
      (SELECT COUNT(*) FROM game_stats gs WHERE gs.user_id = u.id) as totalGames,
      (SELECT COUNT(*) FROM game_stats gs WHERE gs.user_id = u.id AND gs.user_position = 1) as wins,
      (SELECT wins / totalGames * 100
       FROM (SELECT COUNT(*) as totalGames, SUM(user_position = 1) as wins
             FROM game_stats gs
             WHERE gs.user_id = u.id) as subquery) as winRate,
      (SELECT g.text_theme
       FROM games g
              JOIN game_stats gs ON g.id = gs.game_id
       WHERE gs.user_id = u.id
       GROUP BY g.text_theme
       ORDER BY COUNT(*) DESC
       LIMIT 1) as favGenre,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('position', gs.user_position, 'wpm', gs.user_wpm, 'theme', g.text_theme))
       FROM game_stats gs
              JOIN games g ON g.id = gs.game_id
       WHERE gs.user_id = u.id) as playerGames,
      JSON_ARRAYAGG(JSON_ARRAY(gd.text_theme, gd.count)) as genreDistribution,
      (SELECT AVG(gs.user_wpm) FROM game_stats gs WHERE gs.user_id = u.id) as wpm
    FROM users u
           LEFT JOIN (
      SELECT g.text_theme, COUNT(*) as count, gs.user_id
      FROM game_stats gs
             JOIN games g ON g.id = gs.game_id
      GROUP BY gs.user_id, g.text_theme
    ) as gd ON gd.user_id = u.id
    WHERE u.username = ?
  `;

  try {
    const [result] = await pool.execute(query, [username]);
    return result[0];
  } catch (error) {
    console.error('Error executing query in GetProfile:', error);
    return null;
  }
}