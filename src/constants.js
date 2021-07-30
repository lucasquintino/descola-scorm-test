// paths
export const PAGE_HOME = '/';
export const PAGE_RESET_PASSWORD = '/reset-password';
export const PAGE_TRACKS = '/tracks';
export const PAGE_COURSES = '/cursos';
export const PAGE_BUNDLES = '/bundles';
export const PAGE_DESIGN_THINKING = '/design-thinking';
export const PAGE_BLOG = '/blog';
export const PAGE_HELP = '/faq';
export const PAGE_CONTACT = '/contato';
export const PAGE_PRESS_OFFICE = '/imprensa';
export const PAGE_TERMS_AND_CONDITIONS = '/termos-de-uso';
export const PAGE_ABOUT = '/sobre';
export const PAGE_FOR_COMPANIES = '/empresas';
export const PAGE_MY_PROFILE = '/perfil';
export const PAGE_MY_COURSES = '/meus-cursos';
export const PAGE_MY_FAVORITES = '/favoritos';
export const PAGE_MY_CERTIFICATES = '/certificados';
export const PAGE_MY_PURCHASES = '/compras';
export const PAGE_INDICATIONS = '/indications';
export const PAGE_WATCH = '/assistir';
export const PAGE_SIGNATURE = '/signature';
export const PAGE_SOCIAL_RETURN = '/socialReturn';
export const PAGE_LOGIN = '/login';
export const PAGE_ORDER = '/pedidos';
export const PAGE_ATTACHMENTS = '/arquivos';
export const PAGE_SEARCH_RESULTS = '/busca';
export const PAGE_CONTENT_SLUG = '/';

// auth
export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_REGISTER = 'AUTH_REGISTER';
export const AUTH_FORGOT_PASSWORD = 'AUTH_FORGOT_PASSWORD';

// filter courses
export const FILTER_NEWER = ['date', 'DESC'];
export const FILTER_OLDER = ['date', 'ASC'];
export const FILTER_ALPHABETICAL = ['title', 'ASC'];
export const FILTER_ALPHABETICAL_REVERSE = ['title', 'DESC'];
export const FILTER_MORE_EXPENSIVE = ['price', 'DESC'];
export const FILTER_CHEAPER = ['price', 'ASC'];

export const NUMBER_COURSES_VISIBLE = 9;

// types products number
export const TYPE_TRACKS = 1;
export const TYPE_COURSES = 3;
export const TYPE_BUNDLES = 7;
export const TYPE_CERTIFICATES = 8;

// types products string
export const TYPE_TRACKS_STRING = 'Track';
export const TYPE_COURSES_STRING = 'Course';
export const TYPE_BUNDLES_STRING = 'Bundle';
export const TYPE_CREDIT_STRING = 'Credit';
export const TYPE_CERTIFICATES_STRING = 'Certificate';

// types status order
export const TYPE_CREATED = 'Created';
export const TYPE_PROCESSING = 'Processing';
export const TYPE_APPROVED = 'Approved';
export const TYPE_COMPLETED = 'Completed';
export const TYPE_CANCELED = 'Canceled';
export const TYPE_AUTHORIZED = 'Authorized';

// status payment
export const STATUS_PAID = 1;
export const STATUS_WAITING_PAYMENT = 2;
export const STATUS_REFUSED = 3;
export const STATUS_REFUNDED = 4;
export const STATUS_CANCELLED = 5;
export const STATUS_PROCESSING = 6;
export const STATUS_AUTHORIZED = 7;

// types attachments
export const TYPE_EBOOK = 2;

// order my courses
export const ORDER_LAST_WATCHED = 'ORDER_LAST_WATCHED';
export const ORDER_COMPLETED = 'ORDER_COMPLETED';
export const ORDER_MOST_RECENT = 'ORDER_MOST_RECENT';
export const ORDER_TRACKS = 'ORDER_TRACKS';
export const ORDER_COURSES = 'ORDER_COURSES';
export const ORDER_FAVORITES = 'ORDER_FAVORITES';

// payment options
export const CREDIT_CARD = 1;
export const CREDITS = 2;
export const BOLETO = 4;

// order status
export const ONE = 1;
export const TWO = 2;
export const THREE = 3;
export const FOUR = 4;

// BASE URL
export const BASE_URL_CDN = process.env.REACT_APP_CDN;
export const BASE_URL_API = process.env.REACT_APP_API;
export const BASE_URL_CERTIFICATE = process.env.REACT_APP_CERTIFICATE;

export const PAGAR_ME_KEY = process.env.REACT_APP_PAGAR_ME_KEY;

// types on watch
export const TYPE_TRACK_ON_WATCH = 2;
export const TYPE_COURSE_ON_WATCH = 1;

export const TYPE_POST_ACTIVITY_ATTACHMENT = 1;
export const TYPE_POST_ACTIVITY_LECTURE = 2;
export const TYPE_POST_ACTIVITY_CERTIFICATE = 3;

export const TYPE_LECTURE_SELF_HOSTED_VIDEO = 'self_hosted_video';
export const TYPE_LECTURE_VIDEO = 'video';
export const TYPE_LECTURE_TEXT = 'text';
export const TYPE_LECTURE_IFRAME = 'iframe';

// banner
export const CREDITS_ID_3 = 314;
export const CREDITS_ID_5 = 311;
export const CREDITS_ID_10 = 310;
export const CREDITS_ID_20 = 313;
export const CREDITS_ID_ALL = 164;

// course accordions
export const DESCRIPTION = 'DESCRIPTION';
export const CONTENT = 'CONTENT';
export const TESTIMONIALS = 'TESTIMONIALS';
export const TEACHERS = 'TEACHERS';
export const MORE_INFORMATION = 'MORE_INFORMATION';

// API
export const UNAUTHORIZED = 401;
