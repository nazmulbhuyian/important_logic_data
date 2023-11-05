import { Schema, Document, model } from 'mongoose';

interface Overview {
  image: string;
}

interface Tradition {
  title: string;
  image: string;
  about: string;
}

interface ThingsToDo {
  title: string;
  image: string;
  about: string;
}

interface VrImage {
  image: string;
}

interface Discover360Image {
  image: string;
}

interface AllPlaces extends Document {
  country: string;
  district: string;
  division: string;
  sub_district: string;
  place_name: string;
  overview: Overview[];
  overview_video: string;
  tradition: Tradition[];
  three_d_maps: string;
  thinks_to_do: ThingsToDo[];
  vr_image: VrImage[];
  vr_video: string;
  discover_360_image: Discover360Image[];
  discover_360_video: string;
  history: string;
  wildlife: string;
  warning: string;
  trial_guide: string;
  priority: string;
  most_priority: string;
  primary_place_name: string;
  activity: string;
  remarkable_address: string;
  known_as: string;
  about: string;
  image: string;
}

const allPlacesSchema = new Schema<AllPlaces>({
  country: {
    type: String,
    default: "Bangladesh"
  },
  district: {
    type: String,
    required: [true, "Country Name must be required"]
  },
  division: {
    type: String,
    required: [true, "Country Name must be required"]
  },
  sub_district: {
    type: String,
    required: [true, "Sub District Name must be required"]
  },
  place_name: {
    type: String,
    required: [true, "Place Name must be required"],
    minlength: [3, "At least 3 characters must be provided"],
    maxlength: [40, "Name is too large"],
  },
  overview: [
    {
      image: String,
    },
  ],
  overview_video: {
    type: String
  },
  tradition: [
    {
      title: String,
      image: String,
      about: String,
    },
  ],
  three_d_maps: {
    type: String
  },
  thinks_to_do: [
    {
      title: String,
      image: String,
      about: String,
    },
  ],
  vr_image: [
    {
      image: String,
    },
  ],
  vr_video: {
    type: String
  },
  discover_360_image: [
    {
      image: String,
    },
  ],
  discover_360_video: {
    type: String
  },
  history: {
    type: String
  },
  wildlife: {
    type: String
  },
  warning: {
    type: String
  },
  trial_guide: {
    type: String
  },
  priority: {
    type: String,
    default: "NO"
  },
  most_priority: {
    type: String,
    default: "NO"
  },
  primary_place_name: {
    type: String,
    required: [true, "Primary Place Name Required"]
  },
  activity: {
    type: String
  },
  remarkable_address: {
    type: String
  },
  known_as: {
    type: String
  },
  about: {
    type: String
  },
  image: {
    type: String
  }
});

const AllPlacesModel = model<AllPlaces>('AllPlaces', allPlacesSchema);

export default AllPlacesModel;
