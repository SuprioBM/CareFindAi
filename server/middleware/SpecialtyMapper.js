import { DOMAIN_CONFIG } from "../config/domain.config.js";

/**
 * SpecialtyMapper
 * Converts domain signals → medical specialties
 * Clean separation from scoring/decision logic
 */
export class SpecialtyMapper {
  constructor() {
    this.maxDomains = 1;
  }

  /**
   * MAIN ENTRY
   * @param {string[]} topDomains
   */
  map(topDomains = []) {
    if (!topDomains.length) {
      return this.getFallback();
    }

    const selectedDomain = topDomains[0];
    const domainConfig = DOMAIN_CONFIG[selectedDomain];

    if (!domainConfig?.specialties?.length) {
      return this.getFallback();
    }

    return Array.from(new Set(domainConfig.specialties));
  }

  /**
   * fallback when no domain is confident
   */
  getFallback() {
    return ["General Physician"];
  }
}