import React, { useEffect, useState } from 'react';
import './Booking.css'; 

const Booking = () => {
    const TOTAL_SEATS = 80; 
    const [availableSeatsCount, setAvailableSeatsCount] = useState(0); 
    const [requiredSeats, setRequiredSeats] = useState(1); 
    const [bookedSeats, setBookedSeats] = useState([]); 
    const [errorMessage, setErrorMessage] = useState(''); 
    
    useEffect(() => {
        fetchAvailableSeatsCount();
    }, []);

    const fetchAvailableSeatsCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/seats'); 
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setAvailableSeatsCount(data.available_seats_count);
        } catch (error) {
            console.error('Error fetching seats count:', error);
            setErrorMessage('Failed to fetch seat data.');
        }
    };

    const handleBookSeats = async () => {
        if (requiredSeats>7)
        {
            alert('You can book maximum 7 seats at a time!');
            return;
        }
        const starting_seat_no = (TOTAL_SEATS - availableSeatsCount) + 1; 
        const availableSeats = Array.from({ length: requiredSeats }, (_, i) => starting_seat_no + i);
    
        try {
            const response = await fetch('http://localhost:8000/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ seats: availableSeats }),
            });
    
            if (!response.ok) {
                const errorData = await response.json(); 
                throw new Error(errorData.detail || 'Network response was not ok');
            }
    
            const result = await response.json();
            alert('Seats booked successfully!');
    
            setBookedSeats(result.booked_seats);
    
            fetchAvailableSeatsCount();
            setRequiredSeats(1); 
        } catch (error) {
            console.error('Error booking seats:', error);
            setErrorMessage(`Failed to book seats: ${error.message}`);
        }
    };

    const resetDatabase = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to reset the database.');
            }

            await response.json();
            alert('All seats have been reset to available.');
            fetchAvailableSeatsCount(); 
            setBookedSeats([]); 
        } catch (error) {
            console.error('Error resetting database:', error);
            setErrorMessage(`Failed to reset database: ${error.message}`);
        }
    };

    return (
        <div className="booking-container">
            <center><h2>Enter No. of Seats</h2></center>
            <p>Available Seats: {availableSeatsCount}</p>
            <input
                type="number"
                min="1"
                max={availableSeatsCount}
                value={requiredSeats}
                onChange={(e) => setRequiredSeats(Math.min(e.target.value, availableSeatsCount))}
            />
            <button class="book" onClick={handleBookSeats}>
                Book Seats
            </button>
            <button class="reset" onClick={resetDatabase} style={{ marginLeft: '10px' }}>
                Reset Database
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {bookedSeats.length > 0 && (
                <div className="booked-seats">
                    <h3>Booked Seats</h3>
                    <p>Seat Numbers: {bookedSeats.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export default Booking;
