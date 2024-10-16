from fastapi import FastAPI, HTTPException,Request
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)
client = MongoClient("mongodb+srv://saikesav:Gainedi504@cluster0.zhoasvl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0") 
# don't try to use this password, it's just free tier cluster use your own account  :)


db = client['Train_seat_reservation']
seats_collection = db['seats_DB']

class Seat(BaseModel):
    seat_number: int
    status: str

class BookingRequest(BaseModel):
    seats: List[int]

@app.get("/")
async def root():
    return {"message": "Welcome to Train Seat Reservation System"}

@app.get("/api/seats")
async def get_seats():
    # Count available seats
    available_seats_count = seats_collection.count_documents({"status": "available"})
    return { "available_seats_count":available_seats_count}

@app.post("/api/book")
async def book_seats(request: BookingRequest):
    available_seats = []
    
    for seat_number in request.seats:
        seat = seats_collection.find_one({"seat_number": seat_number})
        if seat and seat['status'] == 'available':
            available_seats.append(seat_number)

    if len(available_seats) != len(request.seats):
        raise HTTPException(status_code=400, detail="Some seats are not available.")

    for seat_number in available_seats:
        seats_collection.update_one({"seat_number": seat_number}, {"$set": {"status": "booked"}})

    return {"message": "Seats booked successfully", "booked_seats": available_seats}

@app.post("/api/reset")
async def reset_seats():
    seats_collection.update_many({}, {"$set": {"status": "available"}})
    return {"message": "All seats have been reset to available."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
