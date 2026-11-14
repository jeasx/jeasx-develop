// Simulated content feeds. Every feed is an async function that "fetches" a
// new post after a little latency, like a real API would. The server uses them
// for the first page, the browser for every post arriving afterwards.

export const ME = { id: "me", name: "You", avatar: "🙂", hue: 210 };

export const PEOPLE = [
  { id: "ada", name: "Ada Lovelace", avatar: "👩‍💻", hue: 280 },
  { id: "linus", name: "Linus Byte", avatar: "🧑‍🔧", hue: 25 },
  { id: "grace", name: "Grace Hopper", avatar: "👩‍✈️", hue: 160 },
  { id: "alan", name: "Alan Turing", avatar: "🧑‍🔬", hue: 340 },
  { id: "margaret", name: "Margaret H.", avatar: "🚀", hue: 200 },
  { id: "tim", name: "Tim Webber", avatar: "🕸️", hue: 50 },
];

export const PAGES = {
  news: { id: "news", name: "Daily Byte News", avatar: "📰", hue: 0 },
  weather: { id: "weather", name: "Weather Service", avatar: "⛅", hue: 195 },
  events: { id: "events", name: "Meetups Nearby", avatar: "📅", hue: 120 },
};

export const FEEDS = [
  { id: "friends", label: "Friends", icon: "👥" },
  { id: "photos", label: "Photos", icon: "📷" },
  { id: "news", label: "News", icon: "📰" },
  { id: "polls", label: "Polls", icon: "📊" },
  { id: "weather", label: "Weather", icon: "⛅" },
  { id: "events", label: "Events", icon: "📅" },
];

const STATUSES = [
  "Just shipped a feature without a single bug. Suspicious. 🤔",
  "Coffee #4 today. The code is starting to make sense.",
  "Rewrote the whole thing in JSX. No virtual DOM was harmed.",
  "Anyone else talking to their rubber duck more than to people?",
  "Server-side rendering is back and I'm here for it.",
  "Finally deleted 3,000 lines of code. Best commit ever.",
  "It works on my machine. Shipping my machine tomorrow. 📦",
  "Spent the afternoon reading the HTML spec. Send help.",
  "Hot take: a <form> is the best state manager.",
  "My plants are thriving. My side projects, less so. 🌱",
];

const PHOTOS = [
  { caption: "Sunset at the lake 🌅", scene: "sunset", emoji: "🌅" },
  {
    caption: "Look who visited the office today!",
    scene: "forest",
    emoji: "🐕",
  },
  { caption: "Mountain hike, 1,200 m up ⛰️", scene: "mountain", emoji: "🏔️" },
  { caption: "Homemade pizza night 🍕", scene: "warm", emoji: "🍕" },
  { caption: "City lights from the 30th floor", scene: "night", emoji: "🌃" },
  { caption: "Beach day, laptop stayed home 🏖️", scene: "ocean", emoji: "🏖️" },
];

const NEWS = [
  {
    title: "Study finds HTML-first apps load 3× faster",
    source: "webdev.example",
    tag: "Tech",
  },
  {
    title: "Local library adds a section for programming zines",
    source: "city.example",
    tag: "Local",
  },
  {
    title: "New JavaScript proposal reaches stage 3",
    source: "tc39.example",
    tag: "JavaScript",
  },
  {
    title: "Researchers teach robots to fold laundry, robots refuse",
    source: "science.example",
    tag: "Science",
  },
  {
    title: "Open-source maintainers get a day off, internet survives",
    source: "oss.example",
    tag: "Open Source",
  },
  {
    title: "Why streaming HTML is having a comeback",
    source: "blog.example",
    tag: "Web",
  },
];

const POLLS = [
  {
    question: "Tabs or spaces?",
    options: ["Tabs", "Spaces", "Whatever the formatter says"],
  },
  {
    question: "Best time to deploy?",
    options: ["Monday morning", "Friday 5 pm", "Never"],
  },
  {
    question: "Your favorite way to render HTML?",
    options: ["Server", "Client", "Both with JSX"],
  },
  {
    question: "Coffee or tea?",
    options: ["Coffee ☕", "Tea 🍵", "Energy drinks ⚡"],
  },
];

const WEATHER = [
  { city: "Berlin", icon: "🌧️", text: "Light rain", temp: 9 },
  { city: "Lisbon", icon: "☀️", text: "Sunny", temp: 21 },
  { city: "Oslo", icon: "🌨️", text: "Snow showers", temp: -2 },
  { city: "Rome", icon: "⛅", text: "Partly cloudy", temp: 16 },
  { city: "London", icon: "🌫️", text: "Fog", temp: 11 },
];

const EVENTS = [
  { title: "JSX & Coffee Meetup", place: "Café Hypertext", days: 2 },
  { title: "Web Performance Night", place: "Co-working Loft", days: 5 },
  { title: "Open Source Hack Day", place: "City Library", days: 9 },
  { title: "Intro to Server-Sent Events", place: "Online", days: 1 },
];

const COMMENTS = [
  "😂 so true",
  "Love this!",
  "Same here.",
  "Wow, nice!",
  "Tell me more 👀",
  "Bookmarked.",
  "Couldn't agree more.",
];

/**
 * @template T
 * @param {T[]} list
 * @returns {T}
 */
const pick = (list) => list[Math.floor(Math.random() * list.length)];
/** @type {(min: number, max: number) => number} */
const between = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
/** @type {(ms: number) => Promise<void>} */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let counter = 0;
const id = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** @param {number} max */
function randomComments(max) {
  return Array.from({ length: between(0, max) }, () => ({
    id: id(),
    author: pick(PEOPLE),
    text: pick(COMMENTS),
  }));
}

/** @type {Record<string, () => any>} */
const GENERATORS = {
  friends: () => ({
    type: "status",
    author: pick(PEOPLE),
    text: pick(STATUSES),
    comments: randomComments(2),
  }),
  photos: () => ({
    type: "photo",
    author: pick(PEOPLE),
    photo: pick(PHOTOS),
    comments: randomComments(2),
  }),
  news: () => ({
    type: "news",
    author: PAGES.news,
    article: pick(NEWS),
    comments: [],
  }),
  polls: () => {
    const poll = pick(POLLS);
    return {
      type: "poll",
      author: pick(PEOPLE),
      question: poll.question,
      options: poll.options.map((/** @type {string} */ label) => ({
        label,
        votes: between(0, 40),
      })),
      voted: null,
      comments: [],
    };
  },
  weather: () => {
    const now = pick(WEATHER);
    return {
      type: "weather",
      author: PAGES.weather,
      weather: {
        ...now,
        forecast: ["Tomorrow", "Day after"].map((day) => ({
          day,
          temp: now.temp + between(-4, 4),
        })),
      },
      comments: [],
    };
  },
  events: () => ({
    type: "event",
    author: PAGES.events,
    event: { ...pick(EVENTS), going: between(3, 80) },
    attending: false,
    comments: [],
  }),
};

/**
 * Fetches a new post from a feed (or a random one) with simulated latency.
 *
 * @param {string} [feed]
 * @param {number} [age] how many milliseconds ago it was posted
 */
export async function fetchPost(feed = pick(FEEDS).id, age = 0) {
  await delay(between(50, 300));
  return {
    id: id(),
    feed,
    time: Date.now() - age,
    likes: between(0, 60),
    liked: false,
    ...GENERATORS[feed](),
  };
}

/** The first page: one post from each feed, newest first. */
export async function fetchInitialPosts() {
  const posts = await Promise.all(
    FEEDS.flatMap(({ id }, i) => [fetchPost(id, (i * 2 + 1) * 7 * 60_000)]),
  );
  return posts.sort((a, b) => b.time - a.time);
}

/** A friend reacts to an existing post. */
export function randomComment() {
  return { id: id(), author: pick(PEOPLE), text: pick(COMMENTS) };
}

export { pick, id };

/**
 * "just now", "5 min", "2 h", ...
 *
 * @param {number} time
 * @param {number} [now]
 */
export function timeAgo(time, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 45) {
    return "just now";
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} h`;
  }
  return `${Math.round(hours / 24)} d`;
}
