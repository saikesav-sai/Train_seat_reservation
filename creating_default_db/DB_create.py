from pymongo import MongoClient

client = MongoClient('mongodb+srv://saikesav:****@cluster0.zhoasvl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0') # removed password for security reasons.

db = client['Train_seat_reservation']  

seats_collection = db['seats_DB']  

def create_seat_documents():
    
    if seats_collection.count_documents({}) == 0:  
        seat_documents = []

        
        for row in range(1, 13):  # 1 to 11 (11 rows total)
            if row <= 11:  
                for seat in range(1, 8):  
                    seat_number = (row - 1) * 7 + seat
                    seat_documents.append({
                        "seat_number": seat_number,
                        "row_number": row,
                        "status": "available"  
                    })
            else:  # Last row with only 3 seats
                for seat in range(1, 4):  
                    seat_number = (row - 1) * 7 + seat
                    seat_documents.append({
                        "seat_number": seat_number,
                        "row_number": row,
                        "status": "available" 
                    })

        seats_collection.insert_many(seat_documents)
        print(f"Created and inserted {len(seat_documents)} seat documents into the database.")
    else:
        print("Seats already exist in the database. No new documents were created.")

create_seat_documents()
