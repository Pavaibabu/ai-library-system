import spacy
import json
import pandas as pd
from flask import Flask, request, jsonify
from datetime import datetime
import requests
from utils.db_connection import get_db_connection

app = Flask(__name__)
nlp = spacy.load("en_core_web_md")  

with open ('intent.json') as f:
    INTENTS=json.load(f)

def get_intent(message):
    doc1 = nlp(message)
    max_score = 0.0
    matched_intent = "unknown"

    for intent_obj in INTENTS:
        intent = intent_obj["intent"]
        examples = intent_obj["examples"]

        for example in examples:
            doc2 = nlp(example)
            score = doc1.similarity(doc2)
            if score > max_score:
                max_score = score
                matched_intent = intent

    return matched_intent if max_score > 0.70 else "unknown"
def register_chat_routes(app):
    @app.route('/chat', methods=['POST'])
    def chat():
        user_input = request.json.get('message')
        user_id = request.json.get('user_id')
        

        if not user_input or user_id is None:
            return jsonify({"error": "Missing message or user_id"}), 400

        intent = get_intent(user_input.lower())
        print(f"[DEBUG] Received userId: {user_id}")


        if intent == "borrow_status":
            try:
                res = requests.get("http://localhost:5020/api/User/BorrowHistoryofUser", params={"userId": user_id})
                history = res.json()
                today = datetime.now()

                borrowed_count = 0
                returned_count = 0
                due_soon = 0
                overdue = 0

                for b in history:
                    status = b.get("status", "")
                    if status == "Returned":
                        returned_count += 1
                    else:
                        borrowed_count += 1
                        due_str = b.get("dueDate") or b.get("returnDate")
                        if due_str:
                            try:
                                try:
                                    due_date = datetime.strptime(due_str, "%Y-%m-%d")
                                except ValueError:
                                    due_date = datetime.strptime(due_str, "%Y-%m-%dT%H:%M:%S")
                                diff_days = (due_date - today).days
                                if diff_days < 0:
                                    overdue += 1
                                elif 0 < diff_days <= 3:
                                    due_soon += 1
                            except Exception as date_error:
                                print(f"Date parse error: {date_error}")

                response = (
                    f"You have borrowed {borrowed_count} book(s), "
                    f"returned {returned_count}, "
                    f"{overdue} overdue and "
                    f"{due_soon} book(s) due soon."
                )
                return jsonify({
                    "intent": "borrow_status",
                    "response": response
                })

            except Exception as e:
                return jsonify({
                    "intent": "error",
                    "response": f"Error retrieving book status: {str(e)}"
                }), 500

        elif intent == "borrow_info":
            return jsonify({
                "intent": intent,
                "response": "You can borrow up to from browsebok section and needs to return with in 14 days."
            })

        elif intent == "return_info":
            try:
                res = requests.get("http://localhost:5020/api/User/BorrowHistoryofUser", params={"userId": user_id})
                history = res.json()

                books_to_return = 0

                for b in history:
                    status = b.get("status", "")
                    if status != "Returned":
                        books_to_return += 1

                if books_to_return > 0:
                    response = (
                        f"You currently have {books_to_return} book(s) that need to be returned. "
                        "You can return them by clicking the return button in your borrow history section."
                    )
                else:
                    response = "Great! You have no books to return at the moment."

                return jsonify({
                    "intent": intent,
                    "response": response
                })
            except Exception as e:
                return jsonify({
                    "intent": "error",
                    "response": f"Could not retrieve return information: {str(e)}"
                }), 500


        elif intent == "greet":
            return jsonify({
                "intent": intent,
                "response": "Hello! How can I assist you today?"
            })

        else:
            return jsonify({
                "intent": "unknown",
                "response": "Sorry, I didn’t understand that. Try asking about borrowing, returning, or due books."
            })
