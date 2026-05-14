using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using NovaCloud.BackendCore.DTOs.Auth;
using ChangePasswordRequestDto = NovaCloud.BackendCore.DTOs.Auth.ChangePasswordRequest;

namespace NovaCloud.BackendCore.Services;

public sealed class AuthService : IAuthService
{
    private readonly IAmazonCognitoIdentityProvider _cognito;
    private readonly string _clientId;

    public AuthService(IAmazonCognitoIdentityProvider cognito, IConfiguration configuration)
    {
        _cognito = cognito;
        _clientId = configuration["AWS:ClientId"]
            ?? throw new InvalidOperationException("Missing AWS:ClientId configuration.");
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var authRequest = new InitiateAuthRequest
        {
            AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
            ClientId = _clientId,
            AuthParameters = new Dictionary<string, string>
            {
                ["USERNAME"] = request.Email,
                ["PASSWORD"] = request.Password
            }
        };

        var response = await _cognito.InitiateAuthAsync(authRequest);

        if (response.ChallengeName == ChallengeNameType.NEW_PASSWORD_REQUIRED)
        {
            return new LoginResponse
            {
                Email = request.Email,
                Session = response.Session,
                Token = null,
                RefreshToken = null,
                Role = null
            };
        }

        var result = response.AuthenticationResult;
        if (result is null)
        {
            throw new InvalidOperationException("Authentication failed without a result.");
        }

        var role = GetRoleFromIdToken(result.IdToken);
        var email = GetEmailFromIdToken(result.IdToken) ?? request.Email;

        return new LoginResponse
        {
            Token = result.IdToken,
            AccessToken = result.AccessToken,
            RefreshToken = result.RefreshToken,
            Role = role,
            Email = email
        };
    }

    public async Task<LoginResponse> ChangePasswordAsync(ChangePasswordRequestDto request)
    {
        var challengeRequest = new RespondToAuthChallengeRequest
        {
            ClientId = _clientId,
            ChallengeName = ChallengeNameType.NEW_PASSWORD_REQUIRED,
            Session = request.Session,
            ChallengeResponses = new Dictionary<string, string>
            {
                ["USERNAME"] = request.Email,
                ["NEW_PASSWORD"] = request.NewPassword
            }
        };

        var response = await _cognito.RespondToAuthChallengeAsync(challengeRequest);
        var result = response.AuthenticationResult;
        if (result is null)
        {
            throw new InvalidOperationException("Password change failed without a result.");
        }

        var role = GetRoleFromIdToken(result.IdToken);
        var email = GetEmailFromIdToken(result.IdToken) ?? request.Email;

        return new LoginResponse
        {
            Token = result.IdToken,
            AccessToken = result.AccessToken,
            RefreshToken = result.RefreshToken,
            Role = role,
            Email = email
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var authRequest = new InitiateAuthRequest
        {
            AuthFlow = AuthFlowType.REFRESH_TOKEN_AUTH,
            ClientId = _clientId,
            AuthParameters = new Dictionary<string, string>
            {
                ["REFRESH_TOKEN"] = request.RefreshToken
            }
        };

        var response = await _cognito.InitiateAuthAsync(authRequest);
        var result = response.AuthenticationResult;
        if (result is null)
        {
            throw new InvalidOperationException("Token refresh failed without a result.");
        }

        var role = GetRoleFromIdToken(result.IdToken);
        var email = GetEmailFromIdToken(result.IdToken) ?? request.Email;

        return new LoginResponse
        {
            Token = result.IdToken,
            AccessToken = result.AccessToken,
            RefreshToken = request.RefreshToken,
            Role = role,
            Email = email
        };
    }

    public async Task LogoutAsync(string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new ArgumentException("Access token is required.", nameof(accessToken));
        }

        var request = new GlobalSignOutRequest
        {
            AccessToken = accessToken
        };

        await _cognito.GlobalSignOutAsync(request);
    }

    public MeResponse GetMe(ClaimsPrincipal user)
    {
        var email = GetEmailFromClaims(user.Claims) ?? string.Empty;
        var name = user.FindFirst("name")?.Value
            ?? user.FindFirst(ClaimTypes.Name)?.Value
            ?? email;
        var role = GetRoleFromClaims(user.Claims) ?? string.Empty;

        return new MeResponse
        {
            Email = email,
            Name = name,
            Role = role
        };
    }

    private static string? GetRoleFromIdToken(string? idToken)
    {
        var claims = GetClaimsFromIdToken(idToken);
        return GetRoleFromClaims(claims);
    }

    private static string? GetEmailFromIdToken(string? idToken)
    {
        var claims = GetClaimsFromIdToken(idToken);
        return GetEmailFromClaims(claims);
    }

    private static IEnumerable<Claim> GetClaimsFromIdToken(string? idToken)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            return Array.Empty<Claim>();
        }

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(idToken);
        return token.Claims;
    }

    private static string? GetRoleFromClaims(IEnumerable<Claim> claims)
    {
        foreach (var claim in claims.Where(c => c.Type == "cognito:groups"))
        {
            var role = TryReadGroupValue(claim.Value);
            if (!string.IsNullOrWhiteSpace(role))
            {
                return role;
            }
        }

        return null;
    }

    private static string? GetEmailFromClaims(IEnumerable<Claim> claims)
    {
        return claims.FirstOrDefault(c => c.Type == "email")?.Value
            ?? claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
    }

    private static string? TryReadGroupValue(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        if (!trimmed.StartsWith("[", StringComparison.Ordinal))
        {
            return trimmed;
        }

        try
        {
            using var doc = JsonDocument.Parse(trimmed);
            if (doc.RootElement.ValueKind == JsonValueKind.Array &&
                doc.RootElement.GetArrayLength() > 0)
            {
                return doc.RootElement[0].GetString();
            }
        }
        catch (JsonException)
        {
            return null;
        }

        return null;
    }
}
