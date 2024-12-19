from flask import Flask, request, redirect, url_for, flash, session
import mysql.connector
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Configuration de la base de données MySQL
db_config = {
    'host': 'localhost',
    'user': 'root',  # Remplace par ton utilisateur MySQL
    'password': 'password',  # Remplace par ton mot de passe MySQL
    'database': 'admin_db'
}

# Fonction pour se connecter à la base de données
def get_db_connection():
    connection = mysql.connector.connect(**db_config)
    return connection

@app.route('/change_password', methods=['GET', 'POST'])
def change_password():
    if 'user_id' not in session:
        flash('Vous devez être connecté pour changer votre mot de passe.')
        return redirect(url_for('login'))

    if request.method == 'POST':
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']

        if new_password != confirm_password:
            flash('Les nouveaux mots de passe ne correspondent pas.')
            return redirect(url_for('change_password'))

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Récupérer le mot de passe actuel de l'utilisateur
        cursor.execute('SELECT mot_de_passe FROM utilisateurs WHERE id = %s', (session['user_id'],))
        utilisateur = cursor.fetchone()

        if not utilisateur or not check_password_hash(utilisateur['mot_de_passe'], current_password):
            flash('Le mot de passe actuel est incorrect.')
            cursor.close()
            connection.close()
            return redirect(url_for('change_password'))

        # Mettre à jour le mot de passe avec un nouveau hachage
        hashed_password = generate_password_hash(new_password)
        cursor.execute('UPDATE utilisateurs SET mot_de_passe = %s WHERE id = %s', (hashed_password, session['user_id']))
        connection.commit()

        cursor.close()
        connection.close()

        flash('Votre mot de passe a été changé avec succès.')
        return redirect(url_for('admin_dashboard'))

    return '''
        <form method="POST">
            <label>Mot de passe actuel:</label>
            <input type="password" name="current_password" required><br>
            <label>Nouveau mot de passe:</label>
            <input type="password" name="new_password" required><br>
            <label>Confirmez le nouveau mot de passe:</label>
            <input type="password" name="confirm_password" required><br>
            <button type="submit">Changer le mot de passe</button>
        </form>
    '''

if __name__ == '__main__':
    app.run(debug=True)
