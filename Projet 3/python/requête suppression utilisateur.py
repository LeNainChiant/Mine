from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# Fonction de connexion à la base de données
def connect_to_db(site_web):
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database=site_web
    )
    return connection

# Route pour supprimer le compte utilisateur
@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    try:
        # Récupère l'ID de l'utilisateur depuis le body de la requête
        data = request.get_json()
        user_id = data.get('user_id')
        
        if user_id is None:
            return jsonify({"success": False, "message": "ID utilisateur manquant"}), 400
        
        # Connexion à la base de données
        connection = connect_to_db('user_management')
        cursor = connection.cursor()

        # Suppression de l'utilisateur (cascade gérée par la DB)
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({"success": True, "message": "Compte supprimé avec succès"})
        else:
            return jsonify({"success": False, "message": "Utilisateur non trouvé"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    app.run(debug=True)
