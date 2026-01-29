/** List of all entity types. Populated by the modules introducing EAV entities. */
export var AttributeEntityTypeEnum;
(function (AttributeEntityTypeEnum) {
    AttributeEntityTypeEnum["CatalogCategory"] = "CATALOG_CATEGORY";
    AttributeEntityTypeEnum["CatalogProduct"] = "CATALOG_PRODUCT";
    AttributeEntityTypeEnum["Customer"] = "CUSTOMER";
    AttributeEntityTypeEnum["CustomerAddress"] = "CUSTOMER_ADDRESS";
})(AttributeEntityTypeEnum || (AttributeEntityTypeEnum = {}));
/** EAV attribute frontend input types. */
export var AttributeFrontendInputEnum;
(function (AttributeFrontendInputEnum) {
    AttributeFrontendInputEnum["Boolean"] = "BOOLEAN";
    AttributeFrontendInputEnum["Date"] = "DATE";
    AttributeFrontendInputEnum["Datetime"] = "DATETIME";
    AttributeFrontendInputEnum["File"] = "FILE";
    AttributeFrontendInputEnum["Gallery"] = "GALLERY";
    AttributeFrontendInputEnum["Hidden"] = "HIDDEN";
    AttributeFrontendInputEnum["Image"] = "IMAGE";
    AttributeFrontendInputEnum["MediaImage"] = "MEDIA_IMAGE";
    AttributeFrontendInputEnum["Multiline"] = "MULTILINE";
    AttributeFrontendInputEnum["Multiselect"] = "MULTISELECT";
    AttributeFrontendInputEnum["Price"] = "PRICE";
    AttributeFrontendInputEnum["Select"] = "SELECT";
    AttributeFrontendInputEnum["Text"] = "TEXT";
    AttributeFrontendInputEnum["Textarea"] = "TEXTAREA";
    AttributeFrontendInputEnum["Undefined"] = "UNDEFINED";
    AttributeFrontendInputEnum["Weight"] = "WEIGHT";
})(AttributeFrontendInputEnum || (AttributeFrontendInputEnum = {}));
/** Attribute metadata retrieval error types. */
export var AttributeMetadataErrorType;
(function (AttributeMetadataErrorType) {
    /** The requested attribute was not found. */
    AttributeMetadataErrorType["AttributeNotFound"] = "ATTRIBUTE_NOT_FOUND";
    /** The requested entity was not found. */
    AttributeMetadataErrorType["EntityNotFound"] = "ENTITY_NOT_FOUND";
    /** The filter cannot be applied as it does not belong to the entity */
    AttributeMetadataErrorType["FilterNotFound"] = "FILTER_NOT_FOUND";
    /** Not categorized error, see the error message. */
    AttributeMetadataErrorType["Undefined"] = "UNDEFINED";
})(AttributeMetadataErrorType || (AttributeMetadataErrorType = {}));
export var BatchMutationStatus;
(function (BatchMutationStatus) {
    BatchMutationStatus["Failure"] = "FAILURE";
    BatchMutationStatus["MixedResults"] = "MIXED_RESULTS";
    BatchMutationStatus["Success"] = "SUCCESS";
})(BatchMutationStatus || (BatchMutationStatus = {}));
export var CancelOrderErrorCode;
(function (CancelOrderErrorCode) {
    CancelOrderErrorCode["InvalidOrderStatus"] = "INVALID_ORDER_STATUS";
    CancelOrderErrorCode["OrderCancellationDisabled"] = "ORDER_CANCELLATION_DISABLED";
    CancelOrderErrorCode["OrderNotFound"] = "ORDER_NOT_FOUND";
    CancelOrderErrorCode["PartialOrderItemShipped"] = "PARTIAL_ORDER_ITEM_SHIPPED";
    CancelOrderErrorCode["Unauthorised"] = "UNAUTHORISED";
    CancelOrderErrorCode["Undefined"] = "UNDEFINED";
})(CancelOrderErrorCode || (CancelOrderErrorCode = {}));
export var CartDiscountType;
(function (CartDiscountType) {
    CartDiscountType["Item"] = "ITEM";
    CartDiscountType["Shipping"] = "SHIPPING";
})(CartDiscountType || (CartDiscountType = {}));
export var CartItemErrorType;
(function (CartItemErrorType) {
    CartItemErrorType["ItemIncrements"] = "ITEM_INCREMENTS";
    CartItemErrorType["ItemQty"] = "ITEM_QTY";
    CartItemErrorType["Undefined"] = "UNDEFINED";
})(CartItemErrorType || (CartItemErrorType = {}));
export var CartUserInputErrorType;
(function (CartUserInputErrorType) {
    CartUserInputErrorType["CouldNotFindCartItem"] = "COULD_NOT_FIND_CART_ITEM";
    CartUserInputErrorType["InsufficientStock"] = "INSUFFICIENT_STOCK";
    CartUserInputErrorType["InvalidParameterValue"] = "INVALID_PARAMETER_VALUE";
    CartUserInputErrorType["NotSalable"] = "NOT_SALABLE";
    CartUserInputErrorType["ProductNotFound"] = "PRODUCT_NOT_FOUND";
    CartUserInputErrorType["RequiredParameterMissing"] = "REQUIRED_PARAMETER_MISSING";
    CartUserInputErrorType["Undefined"] = "UNDEFINED";
})(CartUserInputErrorType || (CartUserInputErrorType = {}));
export var CatalogAttributeApplyToEnum;
(function (CatalogAttributeApplyToEnum) {
    CatalogAttributeApplyToEnum["Bundle"] = "BUNDLE";
    CatalogAttributeApplyToEnum["Category"] = "CATEGORY";
    CatalogAttributeApplyToEnum["Configurable"] = "CONFIGURABLE";
    CatalogAttributeApplyToEnum["Downloadable"] = "DOWNLOADABLE";
    CatalogAttributeApplyToEnum["Grouped"] = "GROUPED";
    CatalogAttributeApplyToEnum["Simple"] = "SIMPLE";
    CatalogAttributeApplyToEnum["Virtual"] = "VIRTUAL";
})(CatalogAttributeApplyToEnum || (CatalogAttributeApplyToEnum = {}));
/** Indicates how agreements are accepted. */
export var CheckoutAgreementMode;
(function (CheckoutAgreementMode) {
    /** Conditions are automatically accepted upon checkout. */
    CheckoutAgreementMode["Auto"] = "AUTO";
    /** Shoppers must manually accept the conditions to place an order. */
    CheckoutAgreementMode["Manual"] = "MANUAL";
})(CheckoutAgreementMode || (CheckoutAgreementMode = {}));
export var CheckoutUserInputErrorCodes;
(function (CheckoutUserInputErrorCodes) {
    CheckoutUserInputErrorCodes["InsufficientStock"] = "INSUFFICIENT_STOCK";
    CheckoutUserInputErrorCodes["NotSalable"] = "NOT_SALABLE";
    CheckoutUserInputErrorCodes["ProductNotFound"] = "PRODUCT_NOT_FOUND";
    CheckoutUserInputErrorCodes["ReorderNotAvailable"] = "REORDER_NOT_AVAILABLE";
    CheckoutUserInputErrorCodes["Undefined"] = "UNDEFINED";
})(CheckoutUserInputErrorCodes || (CheckoutUserInputErrorCodes = {}));
/** List of account confirmation statuses. */
export var ConfirmationStatusEnum;
(function (ConfirmationStatusEnum) {
    /** Account confirmation not required */
    ConfirmationStatusEnum["AccountConfirmationNotRequired"] = "ACCOUNT_CONFIRMATION_NOT_REQUIRED";
    /** Account confirmed */
    ConfirmationStatusEnum["AccountConfirmed"] = "ACCOUNT_CONFIRMED";
})(ConfirmationStatusEnum || (ConfirmationStatusEnum = {}));
/** The list of country codes. */
export var CountryCodeEnum;
(function (CountryCodeEnum) {
    /** Andorra */
    CountryCodeEnum["Ad"] = "AD";
    /** United Arab Emirates */
    CountryCodeEnum["Ae"] = "AE";
    /** Afghanistan */
    CountryCodeEnum["Af"] = "AF";
    /** Antigua & Barbuda */
    CountryCodeEnum["Ag"] = "AG";
    /** Anguilla */
    CountryCodeEnum["Ai"] = "AI";
    /** Albania */
    CountryCodeEnum["Al"] = "AL";
    /** Armenia */
    CountryCodeEnum["Am"] = "AM";
    /** Netherlands Antilles */
    CountryCodeEnum["An"] = "AN";
    /** Angola */
    CountryCodeEnum["Ao"] = "AO";
    /** Antarctica */
    CountryCodeEnum["Aq"] = "AQ";
    /** Argentina */
    CountryCodeEnum["Ar"] = "AR";
    /** American Samoa */
    CountryCodeEnum["As"] = "AS";
    /** Austria */
    CountryCodeEnum["At"] = "AT";
    /** Australia */
    CountryCodeEnum["Au"] = "AU";
    /** Aruba */
    CountryCodeEnum["Aw"] = "AW";
    /** Åland Islands */
    CountryCodeEnum["Ax"] = "AX";
    /** Azerbaijan */
    CountryCodeEnum["Az"] = "AZ";
    /** Bosnia & Herzegovina */
    CountryCodeEnum["Ba"] = "BA";
    /** Barbados */
    CountryCodeEnum["Bb"] = "BB";
    /** Bangladesh */
    CountryCodeEnum["Bd"] = "BD";
    /** Belgium */
    CountryCodeEnum["Be"] = "BE";
    /** Burkina Faso */
    CountryCodeEnum["Bf"] = "BF";
    /** Bulgaria */
    CountryCodeEnum["Bg"] = "BG";
    /** Bahrain */
    CountryCodeEnum["Bh"] = "BH";
    /** Burundi */
    CountryCodeEnum["Bi"] = "BI";
    /** Benin */
    CountryCodeEnum["Bj"] = "BJ";
    /** St. Barthélemy */
    CountryCodeEnum["Bl"] = "BL";
    /** Bermuda */
    CountryCodeEnum["Bm"] = "BM";
    /** Brunei */
    CountryCodeEnum["Bn"] = "BN";
    /** Bolivia */
    CountryCodeEnum["Bo"] = "BO";
    /** Brazil */
    CountryCodeEnum["Br"] = "BR";
    /** Bahamas */
    CountryCodeEnum["Bs"] = "BS";
    /** Bhutan */
    CountryCodeEnum["Bt"] = "BT";
    /** Bouvet Island */
    CountryCodeEnum["Bv"] = "BV";
    /** Botswana */
    CountryCodeEnum["Bw"] = "BW";
    /** Belarus */
    CountryCodeEnum["By"] = "BY";
    /** Belize */
    CountryCodeEnum["Bz"] = "BZ";
    /** Canada */
    CountryCodeEnum["Ca"] = "CA";
    /** Cocos (Keeling) Islands */
    CountryCodeEnum["Cc"] = "CC";
    /** Congo-Kinshasa */
    CountryCodeEnum["Cd"] = "CD";
    /** Central African Republic */
    CountryCodeEnum["Cf"] = "CF";
    /** Congo-Brazzaville */
    CountryCodeEnum["Cg"] = "CG";
    /** Switzerland */
    CountryCodeEnum["Ch"] = "CH";
    /** Côte d’Ivoire */
    CountryCodeEnum["Ci"] = "CI";
    /** Cook Islands */
    CountryCodeEnum["Ck"] = "CK";
    /** Chile */
    CountryCodeEnum["Cl"] = "CL";
    /** Cameroon */
    CountryCodeEnum["Cm"] = "CM";
    /** China */
    CountryCodeEnum["Cn"] = "CN";
    /** Colombia */
    CountryCodeEnum["Co"] = "CO";
    /** Costa Rica */
    CountryCodeEnum["Cr"] = "CR";
    /** Cuba */
    CountryCodeEnum["Cu"] = "CU";
    /** Cape Verde */
    CountryCodeEnum["Cv"] = "CV";
    /** Christmas Island */
    CountryCodeEnum["Cx"] = "CX";
    /** Cyprus */
    CountryCodeEnum["Cy"] = "CY";
    /** Czech Republic */
    CountryCodeEnum["Cz"] = "CZ";
    /** Germany */
    CountryCodeEnum["De"] = "DE";
    /** Djibouti */
    CountryCodeEnum["Dj"] = "DJ";
    /** Denmark */
    CountryCodeEnum["Dk"] = "DK";
    /** Dominica */
    CountryCodeEnum["Dm"] = "DM";
    /** Dominican Republic */
    CountryCodeEnum["Do"] = "DO";
    /** Algeria */
    CountryCodeEnum["Dz"] = "DZ";
    /** Ecuador */
    CountryCodeEnum["Ec"] = "EC";
    /** Estonia */
    CountryCodeEnum["Ee"] = "EE";
    /** Egypt */
    CountryCodeEnum["Eg"] = "EG";
    /** Western Sahara */
    CountryCodeEnum["Eh"] = "EH";
    /** Eritrea */
    CountryCodeEnum["Er"] = "ER";
    /** Spain */
    CountryCodeEnum["Es"] = "ES";
    /** Ethiopia */
    CountryCodeEnum["Et"] = "ET";
    /** Finland */
    CountryCodeEnum["Fi"] = "FI";
    /** Fiji */
    CountryCodeEnum["Fj"] = "FJ";
    /** Falkland Islands */
    CountryCodeEnum["Fk"] = "FK";
    /** Micronesia */
    CountryCodeEnum["Fm"] = "FM";
    /** Faroe Islands */
    CountryCodeEnum["Fo"] = "FO";
    /** France */
    CountryCodeEnum["Fr"] = "FR";
    /** Gabon */
    CountryCodeEnum["Ga"] = "GA";
    /** United Kingdom */
    CountryCodeEnum["Gb"] = "GB";
    /** Grenada */
    CountryCodeEnum["Gd"] = "GD";
    /** Georgia */
    CountryCodeEnum["Ge"] = "GE";
    /** French Guiana */
    CountryCodeEnum["Gf"] = "GF";
    /** Guernsey */
    CountryCodeEnum["Gg"] = "GG";
    /** Ghana */
    CountryCodeEnum["Gh"] = "GH";
    /** Gibraltar */
    CountryCodeEnum["Gi"] = "GI";
    /** Greenland */
    CountryCodeEnum["Gl"] = "GL";
    /** Gambia */
    CountryCodeEnum["Gm"] = "GM";
    /** Guinea */
    CountryCodeEnum["Gn"] = "GN";
    /** Guadeloupe */
    CountryCodeEnum["Gp"] = "GP";
    /** Equatorial Guinea */
    CountryCodeEnum["Gq"] = "GQ";
    /** Greece */
    CountryCodeEnum["Gr"] = "GR";
    /** South Georgia & South Sandwich Islands */
    CountryCodeEnum["Gs"] = "GS";
    /** Guatemala */
    CountryCodeEnum["Gt"] = "GT";
    /** Guam */
    CountryCodeEnum["Gu"] = "GU";
    /** Guinea-Bissau */
    CountryCodeEnum["Gw"] = "GW";
    /** Guyana */
    CountryCodeEnum["Gy"] = "GY";
    /** Hong Kong SAR China */
    CountryCodeEnum["Hk"] = "HK";
    /** Heard &amp; McDonald Islands */
    CountryCodeEnum["Hm"] = "HM";
    /** Honduras */
    CountryCodeEnum["Hn"] = "HN";
    /** Croatia */
    CountryCodeEnum["Hr"] = "HR";
    /** Haiti */
    CountryCodeEnum["Ht"] = "HT";
    /** Hungary */
    CountryCodeEnum["Hu"] = "HU";
    /** Indonesia */
    CountryCodeEnum["Id"] = "ID";
    /** Ireland */
    CountryCodeEnum["Ie"] = "IE";
    /** Israel */
    CountryCodeEnum["Il"] = "IL";
    /** Isle of Man */
    CountryCodeEnum["Im"] = "IM";
    /** India */
    CountryCodeEnum["In"] = "IN";
    /** British Indian Ocean Territory */
    CountryCodeEnum["Io"] = "IO";
    /** Iraq */
    CountryCodeEnum["Iq"] = "IQ";
    /** Iran */
    CountryCodeEnum["Ir"] = "IR";
    /** Iceland */
    CountryCodeEnum["Is"] = "IS";
    /** Italy */
    CountryCodeEnum["It"] = "IT";
    /** Jersey */
    CountryCodeEnum["Je"] = "JE";
    /** Jamaica */
    CountryCodeEnum["Jm"] = "JM";
    /** Jordan */
    CountryCodeEnum["Jo"] = "JO";
    /** Japan */
    CountryCodeEnum["Jp"] = "JP";
    /** Kenya */
    CountryCodeEnum["Ke"] = "KE";
    /** Kyrgyzstan */
    CountryCodeEnum["Kg"] = "KG";
    /** Cambodia */
    CountryCodeEnum["Kh"] = "KH";
    /** Kiribati */
    CountryCodeEnum["Ki"] = "KI";
    /** Comoros */
    CountryCodeEnum["Km"] = "KM";
    /** St. Kitts & Nevis */
    CountryCodeEnum["Kn"] = "KN";
    /** North Korea */
    CountryCodeEnum["Kp"] = "KP";
    /** South Korea */
    CountryCodeEnum["Kr"] = "KR";
    /** Kuwait */
    CountryCodeEnum["Kw"] = "KW";
    /** Cayman Islands */
    CountryCodeEnum["Ky"] = "KY";
    /** Kazakhstan */
    CountryCodeEnum["Kz"] = "KZ";
    /** Laos */
    CountryCodeEnum["La"] = "LA";
    /** Lebanon */
    CountryCodeEnum["Lb"] = "LB";
    /** St. Lucia */
    CountryCodeEnum["Lc"] = "LC";
    /** Liechtenstein */
    CountryCodeEnum["Li"] = "LI";
    /** Sri Lanka */
    CountryCodeEnum["Lk"] = "LK";
    /** Liberia */
    CountryCodeEnum["Lr"] = "LR";
    /** Lesotho */
    CountryCodeEnum["Ls"] = "LS";
    /** Lithuania */
    CountryCodeEnum["Lt"] = "LT";
    /** Luxembourg */
    CountryCodeEnum["Lu"] = "LU";
    /** Latvia */
    CountryCodeEnum["Lv"] = "LV";
    /** Libya */
    CountryCodeEnum["Ly"] = "LY";
    /** Morocco */
    CountryCodeEnum["Ma"] = "MA";
    /** Monaco */
    CountryCodeEnum["Mc"] = "MC";
    /** Moldova */
    CountryCodeEnum["Md"] = "MD";
    /** Montenegro */
    CountryCodeEnum["Me"] = "ME";
    /** St. Martin */
    CountryCodeEnum["Mf"] = "MF";
    /** Madagascar */
    CountryCodeEnum["Mg"] = "MG";
    /** Marshall Islands */
    CountryCodeEnum["Mh"] = "MH";
    /** Macedonia */
    CountryCodeEnum["Mk"] = "MK";
    /** Mali */
    CountryCodeEnum["Ml"] = "ML";
    /** Myanmar (Burma) */
    CountryCodeEnum["Mm"] = "MM";
    /** Mongolia */
    CountryCodeEnum["Mn"] = "MN";
    /** Macau SAR China */
    CountryCodeEnum["Mo"] = "MO";
    /** Northern Mariana Islands */
    CountryCodeEnum["Mp"] = "MP";
    /** Martinique */
    CountryCodeEnum["Mq"] = "MQ";
    /** Mauritania */
    CountryCodeEnum["Mr"] = "MR";
    /** Montserrat */
    CountryCodeEnum["Ms"] = "MS";
    /** Malta */
    CountryCodeEnum["Mt"] = "MT";
    /** Mauritius */
    CountryCodeEnum["Mu"] = "MU";
    /** Maldives */
    CountryCodeEnum["Mv"] = "MV";
    /** Malawi */
    CountryCodeEnum["Mw"] = "MW";
    /** Mexico */
    CountryCodeEnum["Mx"] = "MX";
    /** Malaysia */
    CountryCodeEnum["My"] = "MY";
    /** Mozambique */
    CountryCodeEnum["Mz"] = "MZ";
    /** Namibia */
    CountryCodeEnum["Na"] = "NA";
    /** New Caledonia */
    CountryCodeEnum["Nc"] = "NC";
    /** Niger */
    CountryCodeEnum["Ne"] = "NE";
    /** Norfolk Island */
    CountryCodeEnum["Nf"] = "NF";
    /** Nigeria */
    CountryCodeEnum["Ng"] = "NG";
    /** Nicaragua */
    CountryCodeEnum["Ni"] = "NI";
    /** Netherlands */
    CountryCodeEnum["Nl"] = "NL";
    /** Norway */
    CountryCodeEnum["No"] = "NO";
    /** Nepal */
    CountryCodeEnum["Np"] = "NP";
    /** Nauru */
    CountryCodeEnum["Nr"] = "NR";
    /** Niue */
    CountryCodeEnum["Nu"] = "NU";
    /** New Zealand */
    CountryCodeEnum["Nz"] = "NZ";
    /** Oman */
    CountryCodeEnum["Om"] = "OM";
    /** Panama */
    CountryCodeEnum["Pa"] = "PA";
    /** Peru */
    CountryCodeEnum["Pe"] = "PE";
    /** French Polynesia */
    CountryCodeEnum["Pf"] = "PF";
    /** Papua New Guinea */
    CountryCodeEnum["Pg"] = "PG";
    /** Philippines */
    CountryCodeEnum["Ph"] = "PH";
    /** Pakistan */
    CountryCodeEnum["Pk"] = "PK";
    /** Poland */
    CountryCodeEnum["Pl"] = "PL";
    /** St. Pierre & Miquelon */
    CountryCodeEnum["Pm"] = "PM";
    /** Pitcairn Islands */
    CountryCodeEnum["Pn"] = "PN";
    /** Palestinian Territories */
    CountryCodeEnum["Ps"] = "PS";
    /** Portugal */
    CountryCodeEnum["Pt"] = "PT";
    /** Palau */
    CountryCodeEnum["Pw"] = "PW";
    /** Paraguay */
    CountryCodeEnum["Py"] = "PY";
    /** Qatar */
    CountryCodeEnum["Qa"] = "QA";
    /** Réunion */
    CountryCodeEnum["Re"] = "RE";
    /** Romania */
    CountryCodeEnum["Ro"] = "RO";
    /** Serbia */
    CountryCodeEnum["Rs"] = "RS";
    /** Russia */
    CountryCodeEnum["Ru"] = "RU";
    /** Rwanda */
    CountryCodeEnum["Rw"] = "RW";
    /** Saudi Arabia */
    CountryCodeEnum["Sa"] = "SA";
    /** Solomon Islands */
    CountryCodeEnum["Sb"] = "SB";
    /** Seychelles */
    CountryCodeEnum["Sc"] = "SC";
    /** Sudan */
    CountryCodeEnum["Sd"] = "SD";
    /** Sweden */
    CountryCodeEnum["Se"] = "SE";
    /** Singapore */
    CountryCodeEnum["Sg"] = "SG";
    /** St. Helena */
    CountryCodeEnum["Sh"] = "SH";
    /** Slovenia */
    CountryCodeEnum["Si"] = "SI";
    /** Svalbard & Jan Mayen */
    CountryCodeEnum["Sj"] = "SJ";
    /** Slovakia */
    CountryCodeEnum["Sk"] = "SK";
    /** Sierra Leone */
    CountryCodeEnum["Sl"] = "SL";
    /** San Marino */
    CountryCodeEnum["Sm"] = "SM";
    /** Senegal */
    CountryCodeEnum["Sn"] = "SN";
    /** Somalia */
    CountryCodeEnum["So"] = "SO";
    /** Suriname */
    CountryCodeEnum["Sr"] = "SR";
    /** São Tomé & Príncipe */
    CountryCodeEnum["St"] = "ST";
    /** El Salvador */
    CountryCodeEnum["Sv"] = "SV";
    /** Syria */
    CountryCodeEnum["Sy"] = "SY";
    /** Eswatini */
    CountryCodeEnum["Sz"] = "SZ";
    /** Turks & Caicos Islands */
    CountryCodeEnum["Tc"] = "TC";
    /** Chad */
    CountryCodeEnum["Td"] = "TD";
    /** French Southern Territories */
    CountryCodeEnum["Tf"] = "TF";
    /** Togo */
    CountryCodeEnum["Tg"] = "TG";
    /** Thailand */
    CountryCodeEnum["Th"] = "TH";
    /** Tajikistan */
    CountryCodeEnum["Tj"] = "TJ";
    /** Tokelau */
    CountryCodeEnum["Tk"] = "TK";
    /** Timor-Leste */
    CountryCodeEnum["Tl"] = "TL";
    /** Turkmenistan */
    CountryCodeEnum["Tm"] = "TM";
    /** Tunisia */
    CountryCodeEnum["Tn"] = "TN";
    /** Tonga */
    CountryCodeEnum["To"] = "TO";
    /** Turkey */
    CountryCodeEnum["Tr"] = "TR";
    /** Trinidad & Tobago */
    CountryCodeEnum["Tt"] = "TT";
    /** Tuvalu */
    CountryCodeEnum["Tv"] = "TV";
    /** Taiwan */
    CountryCodeEnum["Tw"] = "TW";
    /** Tanzania */
    CountryCodeEnum["Tz"] = "TZ";
    /** Ukraine */
    CountryCodeEnum["Ua"] = "UA";
    /** Uganda */
    CountryCodeEnum["Ug"] = "UG";
    /** U.S. Outlying Islands */
    CountryCodeEnum["Um"] = "UM";
    /** United States */
    CountryCodeEnum["Us"] = "US";
    /** Uruguay */
    CountryCodeEnum["Uy"] = "UY";
    /** Uzbekistan */
    CountryCodeEnum["Uz"] = "UZ";
    /** Vatican City */
    CountryCodeEnum["Va"] = "VA";
    /** St. Vincent & Grenadines */
    CountryCodeEnum["Vc"] = "VC";
    /** Venezuela */
    CountryCodeEnum["Ve"] = "VE";
    /** British Virgin Islands */
    CountryCodeEnum["Vg"] = "VG";
    /** U.S. Virgin Islands */
    CountryCodeEnum["Vi"] = "VI";
    /** Vietnam */
    CountryCodeEnum["Vn"] = "VN";
    /** Vanuatu */
    CountryCodeEnum["Vu"] = "VU";
    /** Wallis & Futuna */
    CountryCodeEnum["Wf"] = "WF";
    /** Samoa */
    CountryCodeEnum["Ws"] = "WS";
    /** Yemen */
    CountryCodeEnum["Ye"] = "YE";
    /** Mayotte */
    CountryCodeEnum["Yt"] = "YT";
    /** South Africa */
    CountryCodeEnum["Za"] = "ZA";
    /** Zambia */
    CountryCodeEnum["Zm"] = "ZM";
    /** Zimbabwe */
    CountryCodeEnum["Zw"] = "ZW";
})(CountryCodeEnum || (CountryCodeEnum = {}));
/** The list of available currency codes. */
export var CurrencyEnum;
(function (CurrencyEnum) {
    CurrencyEnum["Aed"] = "AED";
    CurrencyEnum["Afn"] = "AFN";
    CurrencyEnum["All"] = "ALL";
    CurrencyEnum["Amd"] = "AMD";
    CurrencyEnum["Ang"] = "ANG";
    CurrencyEnum["Aoa"] = "AOA";
    CurrencyEnum["Ars"] = "ARS";
    CurrencyEnum["Aud"] = "AUD";
    CurrencyEnum["Awg"] = "AWG";
    CurrencyEnum["Azm"] = "AZM";
    CurrencyEnum["Azn"] = "AZN";
    CurrencyEnum["Bam"] = "BAM";
    CurrencyEnum["Bbd"] = "BBD";
    CurrencyEnum["Bdt"] = "BDT";
    CurrencyEnum["Bgn"] = "BGN";
    CurrencyEnum["Bhd"] = "BHD";
    CurrencyEnum["Bif"] = "BIF";
    CurrencyEnum["Bmd"] = "BMD";
    CurrencyEnum["Bnd"] = "BND";
    CurrencyEnum["Bob"] = "BOB";
    CurrencyEnum["Brl"] = "BRL";
    CurrencyEnum["Bsd"] = "BSD";
    CurrencyEnum["Btn"] = "BTN";
    CurrencyEnum["Buk"] = "BUK";
    CurrencyEnum["Bwp"] = "BWP";
    CurrencyEnum["Byn"] = "BYN";
    CurrencyEnum["Bzd"] = "BZD";
    CurrencyEnum["Cad"] = "CAD";
    CurrencyEnum["Cdf"] = "CDF";
    CurrencyEnum["Che"] = "CHE";
    CurrencyEnum["Chf"] = "CHF";
    CurrencyEnum["Chw"] = "CHW";
    CurrencyEnum["Clp"] = "CLP";
    CurrencyEnum["Cny"] = "CNY";
    CurrencyEnum["Cop"] = "COP";
    CurrencyEnum["Crc"] = "CRC";
    CurrencyEnum["Cup"] = "CUP";
    CurrencyEnum["Cve"] = "CVE";
    CurrencyEnum["Czk"] = "CZK";
    CurrencyEnum["Djf"] = "DJF";
    CurrencyEnum["Dkk"] = "DKK";
    CurrencyEnum["Dop"] = "DOP";
    CurrencyEnum["Dzd"] = "DZD";
    CurrencyEnum["Eek"] = "EEK";
    CurrencyEnum["Egp"] = "EGP";
    CurrencyEnum["Ern"] = "ERN";
    CurrencyEnum["Etb"] = "ETB";
    CurrencyEnum["Eur"] = "EUR";
    CurrencyEnum["Fjd"] = "FJD";
    CurrencyEnum["Fkp"] = "FKP";
    CurrencyEnum["Gbp"] = "GBP";
    CurrencyEnum["Gek"] = "GEK";
    CurrencyEnum["Gel"] = "GEL";
    CurrencyEnum["Ghs"] = "GHS";
    CurrencyEnum["Gip"] = "GIP";
    CurrencyEnum["Gmd"] = "GMD";
    CurrencyEnum["Gnf"] = "GNF";
    CurrencyEnum["Gqe"] = "GQE";
    CurrencyEnum["Gtq"] = "GTQ";
    CurrencyEnum["Gyd"] = "GYD";
    CurrencyEnum["Hkd"] = "HKD";
    CurrencyEnum["Hnl"] = "HNL";
    CurrencyEnum["Hrk"] = "HRK";
    CurrencyEnum["Htg"] = "HTG";
    CurrencyEnum["Huf"] = "HUF";
    CurrencyEnum["Idr"] = "IDR";
    CurrencyEnum["Ils"] = "ILS";
    CurrencyEnum["Inr"] = "INR";
    CurrencyEnum["Iqd"] = "IQD";
    CurrencyEnum["Irr"] = "IRR";
    CurrencyEnum["Isk"] = "ISK";
    CurrencyEnum["Jmd"] = "JMD";
    CurrencyEnum["Jod"] = "JOD";
    CurrencyEnum["Jpy"] = "JPY";
    CurrencyEnum["Kes"] = "KES";
    CurrencyEnum["Kgs"] = "KGS";
    CurrencyEnum["Khr"] = "KHR";
    CurrencyEnum["Kmf"] = "KMF";
    CurrencyEnum["Kpw"] = "KPW";
    CurrencyEnum["Krw"] = "KRW";
    CurrencyEnum["Kwd"] = "KWD";
    CurrencyEnum["Kyd"] = "KYD";
    CurrencyEnum["Kzt"] = "KZT";
    CurrencyEnum["Lak"] = "LAK";
    CurrencyEnum["Lbp"] = "LBP";
    CurrencyEnum["Lkr"] = "LKR";
    CurrencyEnum["Lrd"] = "LRD";
    CurrencyEnum["Lsl"] = "LSL";
    CurrencyEnum["Lsm"] = "LSM";
    CurrencyEnum["Ltl"] = "LTL";
    CurrencyEnum["Lvl"] = "LVL";
    CurrencyEnum["Lyd"] = "LYD";
    CurrencyEnum["Mad"] = "MAD";
    CurrencyEnum["Mdl"] = "MDL";
    CurrencyEnum["Mga"] = "MGA";
    CurrencyEnum["Mkd"] = "MKD";
    CurrencyEnum["Mmk"] = "MMK";
    CurrencyEnum["Mnt"] = "MNT";
    CurrencyEnum["Mop"] = "MOP";
    CurrencyEnum["Mro"] = "MRO";
    CurrencyEnum["Mur"] = "MUR";
    CurrencyEnum["Mvr"] = "MVR";
    CurrencyEnum["Mwk"] = "MWK";
    CurrencyEnum["Mxn"] = "MXN";
    CurrencyEnum["Myr"] = "MYR";
    CurrencyEnum["Mzn"] = "MZN";
    CurrencyEnum["Nad"] = "NAD";
    CurrencyEnum["Ngn"] = "NGN";
    CurrencyEnum["Nic"] = "NIC";
    CurrencyEnum["Nok"] = "NOK";
    CurrencyEnum["Npr"] = "NPR";
    CurrencyEnum["Nzd"] = "NZD";
    CurrencyEnum["Omr"] = "OMR";
    CurrencyEnum["Pab"] = "PAB";
    CurrencyEnum["Pen"] = "PEN";
    CurrencyEnum["Pgk"] = "PGK";
    CurrencyEnum["Php"] = "PHP";
    CurrencyEnum["Pkr"] = "PKR";
    CurrencyEnum["Pln"] = "PLN";
    CurrencyEnum["Pyg"] = "PYG";
    CurrencyEnum["Qar"] = "QAR";
    CurrencyEnum["Rhd"] = "RHD";
    CurrencyEnum["Rol"] = "ROL";
    CurrencyEnum["Ron"] = "RON";
    CurrencyEnum["Rsd"] = "RSD";
    CurrencyEnum["Rub"] = "RUB";
    CurrencyEnum["Rwf"] = "RWF";
    CurrencyEnum["Sar"] = "SAR";
    CurrencyEnum["Sbd"] = "SBD";
    CurrencyEnum["Scr"] = "SCR";
    CurrencyEnum["Sdg"] = "SDG";
    CurrencyEnum["Sek"] = "SEK";
    CurrencyEnum["Sgd"] = "SGD";
    CurrencyEnum["Shp"] = "SHP";
    CurrencyEnum["Skk"] = "SKK";
    CurrencyEnum["Sll"] = "SLL";
    CurrencyEnum["Sos"] = "SOS";
    CurrencyEnum["Srd"] = "SRD";
    CurrencyEnum["Std"] = "STD";
    CurrencyEnum["Svc"] = "SVC";
    CurrencyEnum["Syp"] = "SYP";
    CurrencyEnum["Szl"] = "SZL";
    CurrencyEnum["Thb"] = "THB";
    CurrencyEnum["Tjs"] = "TJS";
    CurrencyEnum["Tmm"] = "TMM";
    CurrencyEnum["Tnd"] = "TND";
    CurrencyEnum["Top"] = "TOP";
    CurrencyEnum["Trl"] = "TRL";
    CurrencyEnum["Try"] = "TRY";
    CurrencyEnum["Ttd"] = "TTD";
    CurrencyEnum["Twd"] = "TWD";
    CurrencyEnum["Tzs"] = "TZS";
    CurrencyEnum["Uah"] = "UAH";
    CurrencyEnum["Ugx"] = "UGX";
    CurrencyEnum["Usd"] = "USD";
    CurrencyEnum["Uyu"] = "UYU";
    CurrencyEnum["Uzs"] = "UZS";
    CurrencyEnum["Veb"] = "VEB";
    CurrencyEnum["Vef"] = "VEF";
    CurrencyEnum["Vnd"] = "VND";
    CurrencyEnum["Vuv"] = "VUV";
    CurrencyEnum["Wst"] = "WST";
    CurrencyEnum["Xcd"] = "XCD";
    CurrencyEnum["Xof"] = "XOF";
    CurrencyEnum["Xpf"] = "XPF";
    CurrencyEnum["Yer"] = "YER";
    CurrencyEnum["Ytl"] = "YTL";
    CurrencyEnum["Zar"] = "ZAR";
    CurrencyEnum["Zmk"] = "ZMK";
    CurrencyEnum["Zwd"] = "ZWD";
})(CurrencyEnum || (CurrencyEnum = {}));
/** Specifies the field to use for sorting */
export var CustomerOrderSortableField;
(function (CustomerOrderSortableField) {
    /** Sorts customer orders by created_at field */
    CustomerOrderSortableField["CreatedAt"] = "CREATED_AT";
    /** Sorts customer orders by number */
    CustomerOrderSortableField["Number"] = "NUMBER";
})(CustomerOrderSortableField || (CustomerOrderSortableField = {}));
/** Defines the customizable date type. */
export var CustomizableDateTypeEnum;
(function (CustomizableDateTypeEnum) {
    CustomizableDateTypeEnum["Date"] = "DATE";
    CustomizableDateTypeEnum["DateTime"] = "DATE_TIME";
    CustomizableDateTypeEnum["Time"] = "TIME";
})(CustomizableDateTypeEnum || (CustomizableDateTypeEnum = {}));
export var DownloadableFileTypeEnum;
(function (DownloadableFileTypeEnum) {
    /** @deprecated `sample_url` serves to get the downloadable sample */
    DownloadableFileTypeEnum["File"] = "FILE";
    /** @deprecated `sample_url` serves to get the downloadable sample */
    DownloadableFileTypeEnum["Url"] = "URL";
})(DownloadableFileTypeEnum || (DownloadableFileTypeEnum = {}));
export var FilterMatchTypeEnum;
(function (FilterMatchTypeEnum) {
    FilterMatchTypeEnum["Full"] = "FULL";
    FilterMatchTypeEnum["Partial"] = "PARTIAL";
})(FilterMatchTypeEnum || (FilterMatchTypeEnum = {}));
/** Lists display settings for the Fixed Product Tax. */
export var FixedProductTaxDisplaySettings;
(function (FixedProductTaxDisplaySettings) {
    /** The displayed price does not include the FPT amount. The values of `ProductPrice.fixed_product_taxes` and the price including the FPT are displayed separately. This value corresponds to 'Excluding FPT, Including FPT description and final price.' */
    FixedProductTaxDisplaySettings["ExcludeFptAndIncludeWithDetails"] = "EXCLUDE_FPT_AND_INCLUDE_WITH_DETAILS";
    /** The displayed price does not include the FPT amount. The values from `ProductPrice.fixed_product_taxes` are not displayed. This value corresponds to 'Excluding FPT'. */
    FixedProductTaxDisplaySettings["ExcludeFptWithoutDetails"] = "EXCLUDE_FPT_WITHOUT_DETAILS";
    /** The FPT feature is not enabled. You can omit `ProductPrice.fixed_product_taxes` from your query. */
    FixedProductTaxDisplaySettings["FptDisabled"] = "FPT_DISABLED";
    /** The displayed price includes the FPT amount without displaying the `ProductPrice.fixed_product_taxes` values. This value corresponds to 'Including FPT only'. */
    FixedProductTaxDisplaySettings["IncludeFptWithoutDetails"] = "INCLUDE_FPT_WITHOUT_DETAILS";
    /** The displayed price includes the FPT amount while displaying the values of `ProductPrice.fixed_product_taxes` separately. This value corresponds to 'Including FPT and FPT description'. */
    FixedProductTaxDisplaySettings["IncludeFptWithDetails"] = "INCLUDE_FPT_WITH_DETAILS";
})(FixedProductTaxDisplaySettings || (FixedProductTaxDisplaySettings = {}));
/** List of templates/filters applied to customer attribute input. */
export var InputFilterEnum;
(function (InputFilterEnum) {
    /** Forces attribute input to follow the date format. */
    InputFilterEnum["Date"] = "DATE";
    /** Escape HTML Entities. */
    InputFilterEnum["Escapehtml"] = "ESCAPEHTML";
    /** There are no templates or filters to be applied. */
    InputFilterEnum["None"] = "NONE";
    /** Strip HTML Tags. */
    InputFilterEnum["Striptags"] = "STRIPTAGS";
    /** Strip whitespace (or other characters) from the beginning and end of the input. */
    InputFilterEnum["Trim"] = "TRIM";
})(InputFilterEnum || (InputFilterEnum = {}));
/** The list of available order actions. */
export var OrderActionType;
(function (OrderActionType) {
    OrderActionType["Cancel"] = "CANCEL";
    OrderActionType["Reorder"] = "REORDER";
})(OrderActionType || (OrderActionType = {}));
/** Indicates the mode for payment. Applies to the Payflow Link and Payments Advanced payment methods. */
export var PayflowLinkMode;
(function (PayflowLinkMode) {
    PayflowLinkMode["Live"] = "LIVE";
    PayflowLinkMode["Test"] = "TEST";
})(PayflowLinkMode || (PayflowLinkMode = {}));
/** Defines the origin location for that payment request */
export var PaymentLocation;
(function (PaymentLocation) {
    PaymentLocation["Admin"] = "ADMIN";
    PaymentLocation["Cart"] = "CART";
    PaymentLocation["Checkout"] = "CHECKOUT";
    PaymentLocation["Minicart"] = "MINICART";
    PaymentLocation["ProductDetail"] = "PRODUCT_DETAIL";
})(PaymentLocation || (PaymentLocation = {}));
export var PaymentStatusEnum;
(function (PaymentStatusEnum) {
    PaymentStatusEnum["Authorized"] = "AUTHORIZED";
    PaymentStatusEnum["Canceled"] = "CANCELED";
    PaymentStatusEnum["Completed"] = "COMPLETED";
    PaymentStatusEnum["Created"] = "CREATED";
    PaymentStatusEnum["Error"] = "ERROR";
    PaymentStatusEnum["Expired"] = "EXPIRED";
    PaymentStatusEnum["Failed"] = "FAILED";
    PaymentStatusEnum["Open"] = "OPEN";
    PaymentStatusEnum["Paid"] = "PAID";
    PaymentStatusEnum["Pending"] = "PENDING";
    PaymentStatusEnum["Refunded"] = "REFUNDED";
    PaymentStatusEnum["Shipping"] = "SHIPPING";
})(PaymentStatusEnum || (PaymentStatusEnum = {}));
/** The list of available payment token types. */
export var PaymentTokenTypeEnum;
(function (PaymentTokenTypeEnum) {
    /** phpcs:ignore Magento2.GraphQL.ValidArgumentName */
    PaymentTokenTypeEnum["Account"] = "account";
    /** phpcs:ignore Magento2.GraphQL.ValidArgumentName */
    PaymentTokenTypeEnum["Card"] = "card";
})(PaymentTokenTypeEnum || (PaymentTokenTypeEnum = {}));
export var PlaceOrderErrorCodes;
(function (PlaceOrderErrorCodes) {
    PlaceOrderErrorCodes["CartNotActive"] = "CART_NOT_ACTIVE";
    PlaceOrderErrorCodes["CartNotFound"] = "CART_NOT_FOUND";
    PlaceOrderErrorCodes["GuestEmailMissing"] = "GUEST_EMAIL_MISSING";
    PlaceOrderErrorCodes["UnableToPlaceOrder"] = "UNABLE_TO_PLACE_ORDER";
    PlaceOrderErrorCodes["Undefined"] = "UNDEFINED";
})(PlaceOrderErrorCodes || (PlaceOrderErrorCodes = {}));
/** `PriceAdjustment.code` is deprecated. */
export var PriceAdjustmentCodesEnum;
(function (PriceAdjustmentCodesEnum) {
    /** @deprecated `PriceAdjustmentCodesEnum` is deprecated. Tax is included or excluded in the price. Tax is not shown separately in Catalog. */
    PriceAdjustmentCodesEnum["Tax"] = "TAX";
    /** @deprecated WEEE code is deprecated. Use `fixed_product_taxes.label` instead. */
    PriceAdjustmentCodesEnum["Weee"] = "WEEE";
    /** @deprecated Use `fixed_product_taxes` instead.  Tax is included or excluded in price. The tax is not shown separtely in Catalog. */
    PriceAdjustmentCodesEnum["WeeeTax"] = "WEEE_TAX";
})(PriceAdjustmentCodesEnum || (PriceAdjustmentCodesEnum = {}));
/** `PriceAdjustmentDescriptionEnum` is deprecated. States whether a price adjustment is included or excluded. */
export var PriceAdjustmentDescriptionEnum;
(function (PriceAdjustmentDescriptionEnum) {
    PriceAdjustmentDescriptionEnum["Excluded"] = "EXCLUDED";
    PriceAdjustmentDescriptionEnum["Included"] = "INCLUDED";
})(PriceAdjustmentDescriptionEnum || (PriceAdjustmentDescriptionEnum = {}));
/** Defines the price type. */
export var PriceTypeEnum;
(function (PriceTypeEnum) {
    PriceTypeEnum["Dynamic"] = "DYNAMIC";
    PriceTypeEnum["Fixed"] = "FIXED";
    PriceTypeEnum["Percent"] = "PERCENT";
})(PriceTypeEnum || (PriceTypeEnum = {}));
/** Defines whether a bundle product's price is displayed as the lowest possible value or as a range. */
export var PriceViewEnum;
(function (PriceViewEnum) {
    PriceViewEnum["AsLowAs"] = "AS_LOW_AS";
    PriceViewEnum["PriceRange"] = "PRICE_RANGE";
})(PriceViewEnum || (PriceViewEnum = {}));
export var ProductImageThumbnail;
(function (ProductImageThumbnail) {
    /** Use thumbnail of product as image. */
    ProductImageThumbnail["Itself"] = "ITSELF";
    /** Use thumbnail of product's parent as image. */
    ProductImageThumbnail["Parent"] = "PARENT";
})(ProductImageThumbnail || (ProductImageThumbnail = {}));
/** This enumeration states whether a product stock status is in stock or out of stock */
export var ProductStockStatus;
(function (ProductStockStatus) {
    ProductStockStatus["InStock"] = "IN_STOCK";
    ProductStockStatus["OutOfStock"] = "OUT_OF_STOCK";
})(ProductStockStatus || (ProductStockStatus = {}));
export var ReCaptchaFormEnum;
(function (ReCaptchaFormEnum) {
    ReCaptchaFormEnum["Braintree"] = "BRAINTREE";
    ReCaptchaFormEnum["Contact"] = "CONTACT";
    ReCaptchaFormEnum["CustomerCreate"] = "CUSTOMER_CREATE";
    ReCaptchaFormEnum["CustomerEdit"] = "CUSTOMER_EDIT";
    ReCaptchaFormEnum["CustomerForgotPassword"] = "CUSTOMER_FORGOT_PASSWORD";
    ReCaptchaFormEnum["CustomerLogin"] = "CUSTOMER_LOGIN";
    ReCaptchaFormEnum["Newsletter"] = "NEWSLETTER";
    ReCaptchaFormEnum["PlaceOrder"] = "PLACE_ORDER";
    ReCaptchaFormEnum["ProductReview"] = "PRODUCT_REVIEW";
    ReCaptchaFormEnum["ResendConfirmationEmail"] = "RESEND_CONFIRMATION_EMAIL";
    ReCaptchaFormEnum["Sendfriend"] = "SENDFRIEND";
})(ReCaptchaFormEnum || (ReCaptchaFormEnum = {}));
export var ReCaptchaTypeEmum;
(function (ReCaptchaTypeEmum) {
    ReCaptchaTypeEmum["Invisible"] = "INVISIBLE";
    ReCaptchaTypeEmum["Recaptcha"] = "RECAPTCHA";
    ReCaptchaTypeEmum["RecaptchaV3"] = "RECAPTCHA_V3";
})(ReCaptchaTypeEmum || (ReCaptchaTypeEmum = {}));
/** This enumeration defines the scope type for customer orders. */
export var ScopeTypeEnum;
(function (ScopeTypeEnum) {
    ScopeTypeEnum["Global"] = "GLOBAL";
    ScopeTypeEnum["Store"] = "STORE";
    ScopeTypeEnum["Website"] = "WEBSITE";
})(ScopeTypeEnum || (ScopeTypeEnum = {}));
/** Defines whether bundle items must be shipped together. */
export var ShipBundleItemsEnum;
(function (ShipBundleItemsEnum) {
    ShipBundleItemsEnum["Separately"] = "SEPARATELY";
    ShipBundleItemsEnum["Together"] = "TOGETHER";
})(ShipBundleItemsEnum || (ShipBundleItemsEnum = {}));
/** Indicates whether to return results in ascending or descending order. */
export var SortEnum;
(function (SortEnum) {
    SortEnum["Asc"] = "ASC";
    SortEnum["Desc"] = "DESC";
})(SortEnum || (SortEnum = {}));
/** Specifies the field to use for sorting quote items */
export var SortQuoteItemsEnum;
(function (SortQuoteItemsEnum) {
    SortQuoteItemsEnum["BaseDiscountAmount"] = "BASE_DISCOUNT_AMOUNT";
    SortQuoteItemsEnum["BaseDiscountTaxCompensationAmount"] = "BASE_DISCOUNT_TAX_COMPENSATION_AMOUNT";
    SortQuoteItemsEnum["BasePrice"] = "BASE_PRICE";
    SortQuoteItemsEnum["BasePriceIncTax"] = "BASE_PRICE_INC_TAX";
    SortQuoteItemsEnum["BaseRowTotal"] = "BASE_ROW_TOTAL";
    SortQuoteItemsEnum["BaseRowTotalIncTax"] = "BASE_ROW_TOTAL_INC_TAX";
    SortQuoteItemsEnum["BaseTaxAmount"] = "BASE_TAX_AMOUNT";
    SortQuoteItemsEnum["BaseTaxBeforeDiscount"] = "BASE_TAX_BEFORE_DISCOUNT";
    SortQuoteItemsEnum["CreatedAt"] = "CREATED_AT";
    SortQuoteItemsEnum["CustomPrice"] = "CUSTOM_PRICE";
    SortQuoteItemsEnum["Description"] = "DESCRIPTION";
    SortQuoteItemsEnum["DiscountAmount"] = "DISCOUNT_AMOUNT";
    SortQuoteItemsEnum["DiscountPercent"] = "DISCOUNT_PERCENT";
    SortQuoteItemsEnum["DiscountTaxCompensationAmount"] = "DISCOUNT_TAX_COMPENSATION_AMOUNT";
    SortQuoteItemsEnum["FreeShipping"] = "FREE_SHIPPING";
    SortQuoteItemsEnum["ItemId"] = "ITEM_ID";
    SortQuoteItemsEnum["Name"] = "NAME";
    SortQuoteItemsEnum["OriginalCustomPrice"] = "ORIGINAL_CUSTOM_PRICE";
    SortQuoteItemsEnum["Price"] = "PRICE";
    SortQuoteItemsEnum["PriceIncTax"] = "PRICE_INC_TAX";
    SortQuoteItemsEnum["ProductId"] = "PRODUCT_ID";
    SortQuoteItemsEnum["ProductType"] = "PRODUCT_TYPE";
    SortQuoteItemsEnum["Qty"] = "QTY";
    SortQuoteItemsEnum["RowTotal"] = "ROW_TOTAL";
    SortQuoteItemsEnum["RowTotalIncTax"] = "ROW_TOTAL_INC_TAX";
    SortQuoteItemsEnum["RowTotalWithDiscount"] = "ROW_TOTAL_WITH_DISCOUNT";
    SortQuoteItemsEnum["RowWeight"] = "ROW_WEIGHT";
    SortQuoteItemsEnum["Sku"] = "SKU";
    SortQuoteItemsEnum["TaxAmount"] = "TAX_AMOUNT";
    SortQuoteItemsEnum["TaxBeforeDiscount"] = "TAX_BEFORE_DISCOUNT";
    SortQuoteItemsEnum["TaxPercent"] = "TAX_PERCENT";
    SortQuoteItemsEnum["UpdatedAt"] = "UPDATED_AT";
    SortQuoteItemsEnum["Weight"] = "WEIGHT";
})(SortQuoteItemsEnum || (SortQuoteItemsEnum = {}));
/** Indicates the status of the request. */
export var SubscriptionStatusesEnum;
(function (SubscriptionStatusesEnum) {
    SubscriptionStatusesEnum["NotActive"] = "NOT_ACTIVE";
    SubscriptionStatusesEnum["Subscribed"] = "SUBSCRIBED";
    SubscriptionStatusesEnum["Unconfirmed"] = "UNCONFIRMED";
    SubscriptionStatusesEnum["Unsubscribed"] = "UNSUBSCRIBED";
})(SubscriptionStatusesEnum || (SubscriptionStatusesEnum = {}));
/** Swatch attribute metadata input types. */
export var SwatchInputTypeEnum;
(function (SwatchInputTypeEnum) {
    SwatchInputTypeEnum["Boolean"] = "BOOLEAN";
    SwatchInputTypeEnum["Date"] = "DATE";
    SwatchInputTypeEnum["Datetime"] = "DATETIME";
    SwatchInputTypeEnum["Dropdown"] = "DROPDOWN";
    SwatchInputTypeEnum["File"] = "FILE";
    SwatchInputTypeEnum["Gallery"] = "GALLERY";
    SwatchInputTypeEnum["Hidden"] = "HIDDEN";
    SwatchInputTypeEnum["Image"] = "IMAGE";
    SwatchInputTypeEnum["MediaImage"] = "MEDIA_IMAGE";
    SwatchInputTypeEnum["Multiline"] = "MULTILINE";
    SwatchInputTypeEnum["Multiselect"] = "MULTISELECT";
    SwatchInputTypeEnum["Price"] = "PRICE";
    SwatchInputTypeEnum["Select"] = "SELECT";
    SwatchInputTypeEnum["Text"] = "TEXT";
    SwatchInputTypeEnum["Textarea"] = "TEXTAREA";
    SwatchInputTypeEnum["Undefined"] = "UNDEFINED";
    SwatchInputTypeEnum["Visual"] = "VISUAL";
    SwatchInputTypeEnum["Weight"] = "WEIGHT";
})(SwatchInputTypeEnum || (SwatchInputTypeEnum = {}));
export var TaxWrappingEnum;
(function (TaxWrappingEnum) {
    TaxWrappingEnum["DisplayExcludingTax"] = "DISPLAY_EXCLUDING_TAX";
    TaxWrappingEnum["DisplayIncludingTax"] = "DISPLAY_INCLUDING_TAX";
    TaxWrappingEnum["DisplayTypeBoth"] = "DISPLAY_TYPE_BOTH";
})(TaxWrappingEnum || (TaxWrappingEnum = {}));
/** 3D Secure mode. */
export var ThreeDsMode;
(function (ThreeDsMode) {
    ThreeDsMode["Off"] = "OFF";
    ThreeDsMode["ScaAlways"] = "SCA_ALWAYS";
    ThreeDsMode["ScaWhenRequired"] = "SCA_WHEN_REQUIRED";
})(ThreeDsMode || (ThreeDsMode = {}));
/** This enumeration defines the entity type. */
export var UrlRewriteEntityTypeEnum;
(function (UrlRewriteEntityTypeEnum) {
    UrlRewriteEntityTypeEnum["Category"] = "CATEGORY";
    UrlRewriteEntityTypeEnum["CmsPage"] = "CMS_PAGE";
    UrlRewriteEntityTypeEnum["Product"] = "PRODUCT";
})(UrlRewriteEntityTypeEnum || (UrlRewriteEntityTypeEnum = {}));
/** Defines whether the attribute is filterable in layered navigation. */
export var UseInLayeredNavigationOptions;
(function (UseInLayeredNavigationOptions) {
    UseInLayeredNavigationOptions["FilterableNoResult"] = "FILTERABLE_NO_RESULT";
    UseInLayeredNavigationOptions["FilterableWithResults"] = "FILTERABLE_WITH_RESULTS";
    UseInLayeredNavigationOptions["No"] = "NO";
})(UseInLayeredNavigationOptions || (UseInLayeredNavigationOptions = {}));
/** List of validation rule names applied to a customer attribute. */
export var ValidationRuleEnum;
(function (ValidationRuleEnum) {
    ValidationRuleEnum["DateRangeMax"] = "DATE_RANGE_MAX";
    ValidationRuleEnum["DateRangeMin"] = "DATE_RANGE_MIN";
    ValidationRuleEnum["FileExtensions"] = "FILE_EXTENSIONS";
    ValidationRuleEnum["InputValidation"] = "INPUT_VALIDATION";
    ValidationRuleEnum["MaxFileSize"] = "MAX_FILE_SIZE";
    ValidationRuleEnum["MaxImageHeight"] = "MAX_IMAGE_HEIGHT";
    ValidationRuleEnum["MaxImageWidth"] = "MAX_IMAGE_WIDTH";
    ValidationRuleEnum["MaxTextLength"] = "MAX_TEXT_LENGTH";
    ValidationRuleEnum["MinTextLength"] = "MIN_TEXT_LENGTH";
})(ValidationRuleEnum || (ValidationRuleEnum = {}));
/** A list of possible error types. */
export var WishListUserInputErrorType;
(function (WishListUserInputErrorType) {
    WishListUserInputErrorType["ProductNotFound"] = "PRODUCT_NOT_FOUND";
    WishListUserInputErrorType["Undefined"] = "UNDEFINED";
})(WishListUserInputErrorType || (WishListUserInputErrorType = {}));
/** A list of possible error types. */
export var WishlistCartUserInputErrorType;
(function (WishlistCartUserInputErrorType) {
    WishlistCartUserInputErrorType["InsufficientStock"] = "INSUFFICIENT_STOCK";
    WishlistCartUserInputErrorType["NotSalable"] = "NOT_SALABLE";
    WishlistCartUserInputErrorType["ProductNotFound"] = "PRODUCT_NOT_FOUND";
    WishlistCartUserInputErrorType["Undefined"] = "UNDEFINED";
})(WishlistCartUserInputErrorType || (WishlistCartUserInputErrorType = {}));
const defaultWrapper = (action, _operationName, _operationType, _variables) => action();
export function getSdk(client, withWrapper = defaultWrapper) {
    return {};
}
