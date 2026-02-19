/**
 * Anti-Corruption Layer port for organization membership checks.
 *
 * The Song bounded context needs to verify organization membership and roles
 * but should NOT depend on the Organization domain. This port defines a
 * minimal interface that the Song module owns, implemented by an infrastructure
 * adapter that queries the database directly.
 */
export abstract class OrgMembershipPort {
  abstract isMember(
    organizationId: string,
    userId: string,
  ): Promise<boolean>;

  abstract hasRole(
    organizationId: string,
    userId: string,
    role: string,
  ): Promise<boolean>;
}
