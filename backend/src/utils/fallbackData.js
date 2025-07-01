// Fallback data for when NASA APIs are rate-limited or unavailable

export const fallbackAPOD = {
  date: "2024-06-15",
  explanation: "This colorized and digitally sharpened image of the Sun is composed of frames recording emission from hydrogen atoms in the solar chromosphere on June 15, 2024. A dark, serpentine filament snakes across the bright solar disk in this stunning view of solar cycle 25 activity.",
  hdurl: "https://apod.nasa.gov/apod/image/2406/Sun_Meunier_4000.jpg",
  media_type: "image",
  service_version: "v1",
  title: "A Prominent Solar Filament",
  url: "https://apod.nasa.gov/apod/image/2406/Sun_Meunier_1024.jpg"
};

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

export const fallbackEPICData = {
  images: [
    {
      image: "epic_1b_20240615001633",
      date: "2024-06-15 00:16:33",
      image_url: "https://epic.gsfc.nasa.gov/archive/natural/2024/06/15/png/epic_1b_20240615001633.png"
    }
  ]
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

export const isRateLimited = (error) => {
  return error.message?.includes('rate limit') || 
         error.message?.includes('429') ||
         error.response?.status === 429;
}; 