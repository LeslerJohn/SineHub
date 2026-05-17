export interface MockCinema {
  id: string;
  name: string;
  brand: string;
  location: string;
  logoUrl?: string;
}

export interface MockShowtime {
  id: string;
  cinemaId: string;
  movieId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  format: string; // 2D, 3D, IMAX, Director's Club
  price: number;
  bookingUrl: string;
}

export const MOCK_CINEMAS: MockCinema[] = [
  {
    id: "cin-1",
    name: "SM Megamall",
    brand: "SM Cinema",
    location: "Metro Manila",
  },
  {
    id: "cin-2",
    name: "SM North EDSA",
    brand: "SM Cinema",
    location: "Metro Manila",
  },
  {
    id: "cin-3",
    name: "Glorietta 4",
    brand: "Ayala Malls Cinemas",
    location: "Metro Manila",
  },
  {
    id: "cin-4",
    name: "Greenbelt 3",
    brand: "Ayala Malls Cinemas",
    location: "Metro Manila",
  },
  {
    id: "cin-5",
    name: "Trinoma",
    brand: "Ayala Malls Cinemas",
    location: "Metro Manila",
  },
];

// Generate showtimes for a given date and movie
export function getMockShowtimes(movieId: string, date: string): MockShowtime[] {
  // To make it deterministic but "random-looking" based on movie and date
  const seed = parseInt(movieId) + new Date(date).getTime();
  
  const showtimes: MockShowtime[] = [];
  
  MOCK_CINEMAS.forEach((cinema, index) => {
    // Only put showtimes in some cinemas based on pseudo-randomness
    if ((seed + index) % 3 === 0 && index !== 0) return;

    const formats = ["2D", "2D", "IMAX", "Director's Club"];
    const baseHour = 10 + (index % 3); // Start between 10am and 12pm

    // 3 to 5 showtimes per cinema
    const count = 3 + (seed % 3);
    
    for (let i = 0; i < count; i++) {
      const hour = baseHour + (i * 3); // Every ~3 hours
      if (hour > 23) continue;

      const format = formats[(seed + i) % formats.length];
      const minute = ((seed + i) % 4) * 15; // 00, 15, 30, 45
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      let price = 350;
      if (format === "IMAX") price = 750;
      if (format === "Director's Club") price = 600;

      showtimes.push({
        id: `st-${cinema.id}-${i}-${date}`,
        cinemaId: cinema.id,
        movieId,
        date,
        time: timeString,
        format,
        price,
        bookingUrl: `https://example.com/book?cinema=${cinema.id}&movie=${movieId}&time=${timeString}`,
      });
    }
  });

  return showtimes;
}
