// Fallback data for when NASA APIs are rate-limited or unavailable

// Multiple APOD fallback entries for different dates
export const fallbackAPODCollection = {
  "2025-07-01": {
    date: "2025-07-01",
    explanation: "This colorized and digitally sharpened image of the Sun is composed of frames recording emission from hydrogen atoms in the solar chromosphere. A dark, serpentine filament snakes across the bright solar disk in this stunning view of solar cycle 25 activity.",
    hdurl: "https://apod.nasa.gov/apod/image/2406/Sun_Meunier_4000.jpg",
    media_type: "image",
    service_version: "v1",
    title: "A Prominent Solar Filament",
    url: "https://apod.nasa.gov/apod/image/2406/Sun_Meunier_1024.jpg"
  },
  "2025-06-30": {
    date: "2025-06-30",
    explanation: "This stunning view shows the International Space Station silhouetted against the Sun during a solar transit. The entire transit event lasted less than a second, but this single frame captures the moment when the ISS appeared as a dark spot against our star.",
    hdurl: "https://apod.nasa.gov/apod/image/2306/IssTransitSun_Vantuyne_2048.jpg",
    media_type: "image",
    service_version: "v1",
    title: "International Space Station Transits the Sun",
    url: "https://apod.nasa.gov/apod/image/2306/IssTransitSun_Vantuyne_1024.jpg"
  },
  "2025-06-29": {
    date: "2025-06-29",
    explanation: "What created this unusual planetary nebula? NGC 7027 is one of the smallest, brightest, and most unusual planetary nebulae known. The central white dwarf star is surrounded by shells of gas expelled during its final evolutionary stages.",
    hdurl: "https://apod.nasa.gov/apod/image/2305/ngc7027_hubble_2048.jpg",
    media_type: "image",
    service_version: "v1",
    title: "Planetary Nebula NGC 7027",
    url: "https://apod.nasa.gov/apod/image/2305/ngc7027_hubble_1024.jpg"
  },
  "2025-06-28": {
    date: "2025-06-28",
    explanation: "The Andromeda Galaxy is the nearest major galaxy to our Milky Way. This deep image shows Andromeda's spiral structure along with two prominent satellite galaxies. Also known as M31, the Andromeda Galaxy is located about 2.5 million light-years away.",
    hdurl: "https://apod.nasa.gov/apod/image/2405/M31_Dyer_4096.jpg", 
    media_type: "image",
    service_version: "v1",
    title: "The Andromeda Galaxy",
    url: "https://apod.nasa.gov/apod/image/2405/M31_Dyer_1024.jpg"
  },
  "2025-06-27": {
    date: "2025-06-27",
    explanation: "This spectacular aurora was photographed from the International Space Station as it orbited high above the Earth. The dancing lights of the aurora are caused by charged particles from the Sun interacting with Earth's magnetic field and atmosphere.",
    hdurl: "https://apod.nasa.gov/apod/image/2304/aurora_iss_4096.jpg",
    media_type: "image", 
    service_version: "v1",
    title: "Aurora from the Space Station",
    url: "https://apod.nasa.gov/apod/image/2304/aurora_iss_1024.jpg"
  },
  "2025-06-26": {
    date: "2025-06-26",
    explanation: "The Eagle Nebula is a star-forming region located about 7,000 light-years away in the constellation Serpens. This iconic nebula contains the famous 'Pillars of Creation' - towering columns of gas and dust where new stars are being born.",
    hdurl: "https://apod.nasa.gov/apod/image/2304/eagle_nebula_hst_4096.jpg",
    media_type: "image",
    service_version: "v1", 
    title: "The Eagle Nebula",
    url: "https://apod.nasa.gov/apod/image/2304/eagle_nebula_hst_1024.jpg"
  },
  "2025-06-25": {
    date: "2025-06-25",
    explanation: "Saturn's largest moon Titan has a thick atmosphere and lakes of liquid methane. This infrared image from the Cassini spacecraft reveals the moon's surface features through its hazy atmosphere, showing a world both alien and fascinating.",
    hdurl: "https://apod.nasa.gov/apod/image/2303/titan_cassini_4096.jpg",
    media_type: "image",
    service_version: "v1",
    title: "Titan: Saturn's Largest Moon", 
    url: "https://apod.nasa.gov/apod/image/2303/titan_cassini_1024.jpg"
  }
};

// Get fallback APOD for a specific date or closest available
export const getFallbackAPOD = (requestedDate) => {
  if (!requestedDate) {
    // Return today's date or latest available
    const today = new Date().toISOString().split('T')[0];
    return fallbackAPODCollection[today] || fallbackAPODCollection["2025-07-01"];
  }
  
  // Check if we have exact date
  if (fallbackAPODCollection[requestedDate]) {
    return fallbackAPODCollection[requestedDate];
  }
  
  // Find closest available date
  const availableDates = Object.keys(fallbackAPODCollection).sort();
  const requestedTime = new Date(requestedDate).getTime();
  
  let closestDate = availableDates[0];
  let smallestDiff = Math.abs(new Date(closestDate).getTime() - requestedTime);
  
  for (const date of availableDates) {
    const diff = Math.abs(new Date(date).getTime() - requestedTime);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestDate = date;
    }
  }
  
  return fallbackAPODCollection[closestDate];
};

// Legacy single fallback for backward compatibility
export const fallbackAPOD = fallbackAPODCollection["2025-07-01"];

export const fallbackMarsPhotos = {
  photos: [
    {
      id: 1000000,
      sol: 1000,
      camera: {
        id: 20,
        name: "FHAZ",
        rover_id: 5,
        full_name: "Front Hazard Avoidance Camera"
      },
      img_src: "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG",
      earth_date: "2015-05-30",
      rover: {
        id: 5,
        name: "Curiosity",
        landing_date: "2012-08-06",
        launch_date: "2011-11-26",
        status: "active"
      }
    }
  ],
  total: 1
};

export const fallbackNEOData = {
  element_count: 2,
  links: {
    next: null,
    prev: null,
    self: "https://api.nasa.gov/neo/rest/v1/feed"
  },
  near_earth_objects: {
    "2024-06-15": [
      {
        id: "54016112",
        neo_reference_id: "54016112",
        name: "(2020 GE)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=54016112",
        absolute_magnitude_h: 22.1,
        estimated_diameter: {
          meters: {
            estimated_diameter_min: 134.2,
            estimated_diameter_max: 300.1
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: "2024-06-15",
            close_approach_date_full: "2024-Jun-15 12:30",
            epoch_date_close_approach: 1718456400000,
            relative_velocity: {
              kilometers_per_second: "15.22",
              kilometers_per_hour: "54783.12",
              miles_per_hour: "34029.45"
            },
            miss_distance: {
              astronomical: "0.0489",
              lunar: "19.03",
              kilometers: "7329803.2",
              miles: "4552678.8"
            }
          }
        ]
      },
      {
        id: "54016113",
        neo_reference_id: "54016113",
        name: "(2020 AF)",
        nasa_jpl_url: "http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=54016113",
        absolute_magnitude_h: 24.5,
        estimated_diameter: {
          meters: {
            estimated_diameter_min: 45.8,
            estimated_diameter_max: 102.4
          }
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: "2024-06-15",
            close_approach_date_full: "2024-Jun-15 08:15",
            epoch_date_close_approach: 1718441700000,
            relative_velocity: {
              kilometers_per_second: "6.43",
              kilometers_per_hour: "23156.78",
              miles_per_hour: "14384.23"
            },
            miss_distance: {
              astronomical: "0.1031",
              lunar: "40.11",
              kilometers: "15432567.1",
              miles: "9587432.3"
            }
          }
        ]
      }
    ]
  }
};

export const fallbackSearchResults = {
  collection: {
    version: "1.0",
    href: "https://images-api.nasa.gov/search",
    items: [
      {
        href: "https://images-assets.nasa.gov/image/PIA12348/collection.json",
        data: [
          {
            nasa_id: "PIA12348",
            title: "Hubble Space Telescope",
            description: "The Hubble Space Telescope floating in space.",
            media_type: "image",
            date_created: "2009-05-11T00:00:00Z"
          }
        ],
        links: [
          {
            href: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~thumb.jpg",
            rel: "preview",
            render: "image"
          }
        ]
      }
    ]
  }
};

export const fallbackRoverManifest = {
  photo_manifest: {
    name: "Curiosity",
    landing_date: "2012-08-06",
    launch_date: "2011-11-26",
    status: "active",
    max_sol: 4000,
    max_date: "2024-06-15",
    total_photos: 695000,
    photos: [
      {
        sol: 1000,
        earth_date: "2015-05-30",
        total_photos: 45,
        cameras: ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"]
      }
    ]
  }
};

export const isRateLimited = (error) => {
  return error.message?.includes('rate limit') || 
         error.message?.includes('429') ||
         error.response?.status === 429;
}; 