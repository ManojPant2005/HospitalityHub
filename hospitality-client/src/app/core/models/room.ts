export interface Room {
    id : number;
    roomNumber : string;
    type : string;
    pricePerNight : number;
    isAvailable : boolean;
}

export interface Booking{
    id : number;
    roomId : number;
    guestName : string;
    guestEmail : string;
    checkIn : string;
    checkOut : string;
    status : string;
    totalAmount : number;
    room?: Room;
}