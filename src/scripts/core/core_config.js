import { OIL_CONFIG } from './core_constants.js';
import { logError, logInfo } from './core_log.js';
import { getGlobalOilObject, isObject, OilVersion, setGlobalOilObject } from './core_utils';

let cachedConfig = null;

/**
 * Read configuration of component from JSON script block
 * @param configurationElement - DOM config element
 * @returns {{}} extracted configuration as JSON
 * @function
 */
function readConfiguration(configurationElement) {
  let parsedConfig = {};
  try {
    if (configurationElement && configurationElement.text) {
      parsedConfig = JSON.parse(configurationElement.text);
      logInfo('Parsed config', parsedConfig);
    }
  } catch (errorDetails) {
    logError('Error config', errorDetails);
  }
  return parsedConfig;
}

/**
 * Get OIL configuration from HTML document
 * @returns Object parsed config
 */
function getConfiguration() {
  if (!cachedConfig) {
    let configurationElement = document.querySelector('script[type="application/configuration"]#oil-configuration');
    if (configurationElement === null) {
      logInfo('Using default config');
    }
    cachedConfig = readConfiguration(configurationElement);
    parseLocaleAndServerUrl(cachedConfig);
  }
  return cachedConfig;
}

/**
 * 1) Extracts the locale from the config. The locale can be a string to use with the language backend
 * or it can be an object containing all labels
 *
 * 2) Sets the publicPath for async loading from Webpack
 * cf. https://webpack.js.org/guides/public-path/
 *
 * @param cachedConfig
 */
// FIXME needs testing
function parseLocaleAndServerUrl(cachedConfig) {
  if (isObject(cachedConfig.locale)) {
    setGlobalOilObject('LOCALE', cachedConfig.locale);
  }
  if (cachedConfig.publicPath) {
    __webpack_public_path__ = cachedConfig.publicPath;
  }
}


/**
 * Returns a config value or its given default value if not existing in users configuration.
 *
 * @param {string} name in form of the key of the config value
 * @param {string} defaultValue as fallback if there is no value found for the key (name)
 * @returns {*}
 */
export function getConfigValue(name, defaultValue) {
  let config = getConfiguration();
  return (config && config[name]) ? config[name] : defaultValue;
}

// **
//  Public Interface
// **
/**
 * Checks if PreviewMode is activated.
 * @returns {*}
 */
export function isPreviewMode() {
  return getConfigValue(OIL_CONFIG.ATTR_PREVIEW_MODE, false);
}

/**
 * Checks if POI is activated.
 * @returns {*}
 */
export function isPoiActive() {
  return getConfigValue(OIL_CONFIG.ATTR_ACTIVATE_POI, false);
}

export function isSubscriberSetCookieActive() {
  return getConfigValue(OIL_CONFIG.ATTR_SUB_SET_COOKIE, true);
}

/**
 *
 * Get the hub iFrame domain with protocol prefix for the current location
 * @returns {string, null} domain iframe orgin
 */
export function getHubOrigin() {
  let origin = getConfigValue(OIL_CONFIG.ATTR_HUB_ORIGIN, '//oil.axelspringer.com');
  if (origin) {
    return origin.indexOf('http') !== -1 ? origin : location.protocol + origin;
  }
  return null;
}

export function getHubPath() {
  return getConfigValue(OIL_CONFIG.ATTR_HUB_PATH, `/release/${OilVersion.getLatestReleaseVersion()}/hub.html`);
}

export function getOilBackendUrl() {
  return getConfigValue(OIL_CONFIG.ATTR_OIL_BACKEND_URL, 'https://oil-backend.herokuapp.com/oil');
}

export function getIabVendorListUrl() {
  return getConfigValue(OIL_CONFIG.ATTR_IAB_VENDOR_LIST_URL, undefined);
}

export function getIabVendorBlacklist() {
  return getConfigValue(OIL_CONFIG.ATTR_IAB_VENDOR_BLACKLIST, undefined);
}

export function getIabVendorWhitelist() {
  return getConfigValue(OIL_CONFIG.ATTR_IAB_VENDOR_WHITELIST, undefined);
}

export function getPoiGroupName() {
  return getConfigValue(OIL_CONFIG.ATTR_POI_GROUP_NAME, 'default');
}

export function getCookieExpireInDays() {
  return getConfigValue(OIL_CONFIG.ATTR_COOKIE_EXPIRES_IN_DAYS, 31);
}

// FIXME
export function getLocaleVariantName() {
  let localeVariantName = getConfigValue(OIL_CONFIG.ATTR_LOCALE, undefined);
  if (!localeVariantName) {
    localeVariantName = 'enEN_01';
    logError(`The locale is not set, falling back to ${localeVariantName}.`);
  }
  if (localeVariantName && isObject(localeVariantName)) {
    return localeVariantName.localeId;
  }
  return localeVariantName;
}

/**
 * Get the hub iFrame URL with protocol prefix for the current location
 * @returns {string, null} complete iframe orgin
 */
export function getHubLocation() {
  if (getHubOrigin() && getHubPath()) {
    return getHubOrigin() + getHubPath();
  }
  return null;
}

/**
 * Reset configuration, reread from HTML.
 */
export function resetConfiguration() {
  cachedConfig = null;
}

export function getCustomPurposes() {
  return getConfigValue(OIL_CONFIG.ATTR_CUSTOM_PURPOSES, []);
}

/**
 * Define whether in the advanced settings window checkboxes
 * should be activated by default, even when no consent was given
 * @return {bool, false}
 */
export function getAdvancedSettingsPurposesDefault() {
  return getConfigValue(OIL_CONFIG.ATTR_ADVANCED_SETTINGS_PURPOSES_DEFAULT, false);
}

export function getDefaultToOptin() {
  return getConfigValue(OIL_CONFIG.ATTR_DEFAULT_TO_OPTIN, false);
}
