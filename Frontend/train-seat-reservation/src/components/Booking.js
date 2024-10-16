import React, { useEffect, useState } from 'react';
import './Booking.css'; 

const Booking = () => {
    const [seats, setSeats] = useState([]);
    const [requiredSeats, setRequiredSeats] = useState(1);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/seats'); 
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setSeats(data);
            } catch (error) {
                console.error('Error fetching seats:', error);
            }
        };
        fetchSeats();
    }, []);

    const availableSeatsCount = seats.filter(seat => seat.status === 'available').length;

    const handleBookSeats = async () => {
        if (requiredSeats > availableSeatsCount) {
            setErrorMessage(`Only ${availableSeatsCount} seats available.`);
            return;
        }

        const availableSeats = seats
            .filter(seat => seat.status === 'available')
            .slice(0, requiredSeats)
            .map(seat => seat.seat_number);

        try {
            const response = await fetch('http://localhost:8000/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ seats: availableSeats }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            alert('Seats booked successfully!');
            setBookedSeats(availableSeats);
            // Optionally refresh seat data
            const seatsResponse = await fetch('http://localhost:8000/api/seats');
            const seatsData = await seatsResponse.json();
            setSeats(seatsData);
            setRequiredSeats(1); // Reset required seats
        } catch (error) {
            console.error('Error booking seats:', error);
            setErrorMessage('Failed to book seats.');
        }
    };

    return (
        
        <div className="booking-container">
            <center><h2>Train Seat Reservation</h2></center>
            <p>Available Seats: {availableSeatsCount}</p>
            <input
                type="number"
                min="1"
                max={availableSeatsCount}
                value={requiredSeats}
                onChange={(e) => setRequiredSeats(Math.min(e.target.value, availableSeatsCount))}
            />
            <button onClick={handleBookSeats}>
                Book Seats
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
