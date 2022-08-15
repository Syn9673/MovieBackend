import { Schema, model } from 'mongoose'
import {
  ISeriesData,
  IEpisodeData,

  IVideoMeta,
  ITrailerData,

  ILockData,
  IVideoData,

  IVideoImageData,
  IVideoMiscData,

  ILibraryContent,
  IUser,
  IUserTiers
} from './types/Database'

const EpisodeSchema = new Schema<IEpisodeData>(
    {
      title: { type: Schema.Types.String, required: true },
      desc: Schema.Types.String,
    
      thumbnail: Schema.Types.String
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  SeriesSchema = new Schema<ISeriesData>(
    {
      seasons: Schema.Types.Number,
      episodes: [
        [EpisodeSchema]
      ]
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  MetaSchema = new Schema<IVideoMeta>(
    {
      title: { type: Schema.Types.String, required: true },
      desc: Schema.Types.String
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  TrailerSchema = new Schema<ITrailerData>(
    {
      show: Schema.Types.Boolean,
      url: { type: Schema.Types.String, required: true }
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  LockSchema = new Schema<ILockData>(
    {
      until: Schema.Types.Number,
      hide: Schema.Types.Boolean
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  VideoImageSchema = new Schema<IVideoImageData>(
    {
      poster: Schema.Types.String,
      cover: Schema.Types.String,

      thumbnail: { type: Schema.Types.String, required: true }
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  MiscSchema = new Schema<IVideoMiscData>(
    {
      video: Schema.Types.String,
      subs: Schema.Types.String,

      pinned: Schema.Types.Boolean,
      upcoming: Schema.Types.Boolean
    },
    {
      _id: false,
      versionKey: false
    }
  ),
  VideoSchema = new Schema<IVideoData>(
    {
      addedAt: {
        type: Schema.Types.Number,
        required: true,
        immutable: true
      },
      available: Schema.Types.Boolean,

      series: SeriesSchema,
      meta: { type: MetaSchema, required: true },

      trailer: TrailerSchema,
      lock: LockSchema,

      runtime: Schema.Types.Number,
      images: VideoImageSchema,

      misc: MiscSchema,
      badges: { type: [Schema.Types.String], required: true },

      requests: { type: Schema.Types.Number, default: 0 }
    },
    { versionKey: false }
  )

const LibraryContentSchema = new Schema<ILibraryContent>(
  {
    videoId: { type: Schema.Types.String, required: true },
    public: Schema.Types.Boolean
  },
  {
    _id: false,
    versionKey: false
  }
),
  UserSchema = new Schema<IUser>(
    {
      password: { type: Schema.Types.String, required: true },
      email: { type: Schema.Types.String, required: true, unique: true },

      library: [LibraryContentSchema],
      tier: { type: Schema.Types.Number, default: IUserTiers.FREE }
    },
    { versionKey: false }
  )

const models = {
  Videos: model('Videos', VideoSchema),
  Users: model('Users', UserSchema)
}

export default models