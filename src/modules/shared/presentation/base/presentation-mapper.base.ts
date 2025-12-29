export abstract class ResponseMapper<DomainEntity, ResponseDto> {
  /**
   * Convert Domain Entity to Response DTO
   *
   * @param domain - Domain entity (with ID)
   * @returns Response DTO for API
   */
  abstract toDto(domain: DomainEntity): ResponseDto;

  /**
   * Bulk conversion helper
   */
  public toDtoMany(domain: DomainEntity[]): ResponseDto[] {
    return domain.map((item) => this.toDto(item));
  }
}
