/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * ============================================================
 *  🍡 MUSHU GLSL — vendored (MIT)
 * ============================================================
 *
 * Vendored from: https://github.com/ConflictingTheories/mushu
 * (src/glsl/shaders.js)
 * Copyright (c) Kyle Derby MacInnis — MIT License.
 *
 * GLSL snippet library: hash, noise, fbm, voronoi, domain
 * warping, colors, SDF, tonemapping. Used to author new
 * PixoSpritz effects without reinventing shader utilities.
 * Do not edit semantics here — upstream fixes belong in the
 * mushu repo; re-vendor after pulling them.
 */

/**
 * mushu/glsl — GLSL Shader Utilities & Snippets
 *
 * Exports many GLSL snippet strings (noise, hash, fbm, voronoi, color helpers)
 * intended to be interpolated into fragment shaders. These are plain strings
 * that can be imported selectively to keep payload small.
 * @module mushu/glsl/shaders
 */

// ═══════════════════════════════════════════════════════════════════════════
// mushu/glsl — GLSL Shader Utilities & Snippets
// 
// Import shader code snippets to compose complex effects:
//   import { noise, fbm, voronoi } from 'mushu/glsl';
//   
//   shader(`
//     ${noise}
//     ${fbm}
//     void mainImage(out vec4 O, vec2 C) {
//       float n = fbm(vec3(C * 0.01, time));
//       O = vec4(vec3(n), 1.0);
//     }
//   `)
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Hash Functions
// ─────────────────────────────────────────────────────────────────────────────

export const hash1 = /* glsl */`
float hash1(float p) {
  return fract(sin(p * 127.1) * 43758.5453);
}`;

export const hash2 = /* glsl */`
float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}`;

export const hash3 = /* glsl */`
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}`;

export const hash2to2 = /* glsl */`
vec2 hash2to2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}`;

export const hash = /* glsl */`
${hash1}
${hash2}
${hash3}
${hash2to2}`;

// ─────────────────────────────────────────────────────────────────────────────
// Noise Functions
// ─────────────────────────────────────────────────────────────────────────────

export const noise2D = /* glsl */`
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}`;

export const noise3D = /* glsl */`
float hash3_internal(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(mix(hash3_internal(i), hash3_internal(i + vec3(1,0,0)), f.x),
        mix(hash3_internal(i + vec3(0,1,0)), hash3_internal(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3_internal(i + vec3(0,0,1)), hash3_internal(i + vec3(1,0,1)), f.x),
        mix(hash3_internal(i + vec3(0,1,1)), hash3_internal(i + vec3(1,1,1)), f.x), f.y), f.z);
}`;

export const noise = /* glsl */`
${noise2D}
${noise3D}`;

// ─────────────────────────────────────────────────────────────────────────────
// Simplex Noise
// ─────────────────────────────────────────────────────────────────────────────

export const simplex2D = /* glsl */`
vec3 permute_simplex(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float simplex2D(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute_simplex(permute_simplex(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

// ─────────────────────────────────────────────────────────────────────────────
// Fractal Brownian Motion
// ─────────────────────────────────────────────────────────────────────────────

export const fbm2D = /* glsl */`
${noise2D}

float fbm2D(vec2 p) {
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    f += amp * noise2D(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return f;
}`;

export const fbm3D = /* glsl */`
${noise3D}

float fbm3D(vec3 p) {
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    f += amp * noise3D(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return f;
}`;

export const fbm = /* glsl */`
${fbm2D}
${fbm3D}`;

// ─────────────────────────────────────────────────────────────────────────────
// Voronoi / Cellular Noise
// ─────────────────────────────────────────────────────────────────────────────

export const voronoi = /* glsl */`
vec2 hash2to2_voronoi(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

vec3 voronoi(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  
  float minDist = 8.0;
  float minDist2 = 8.0;
  vec2 minPoint = vec2(0.0);
  
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 b = vec2(float(i), float(j));
      vec2 r = b - f + hash2to2_voronoi(n + b);
      float d = dot(r, r);
      
      if (d < minDist) {
        minDist2 = minDist;
        minDist = d;
        minPoint = r;
      } else if (d < minDist2) {
        minDist2 = d;
      }
    }
  }
  
  return vec3(sqrt(minDist), sqrt(minDist2), sqrt(minDist2) - sqrt(minDist));
}`;

// ─────────────────────────────────────────────────────────────────────────────
// Domain Warping
// ─────────────────────────────────────────────────────────────────────────────

export const warp = /* glsl */`
${fbm2D}

float warpedNoise(vec2 p, float t) {
  vec2 q = vec2(
    fbm2D(p + vec2(0.0, 0.0)),
    fbm2D(p + vec2(5.2, 1.3))
  );
  
  vec2 r = vec2(
    fbm2D(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm2D(p + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t)
  );
  
  return fbm2D(p + 4.0 * r);
}`;

// ─────────────────────────────────────────────────────────────────────────────
// 3D Lighting — Blinn-Phong and PBR
// ─────────────────────────────────────────────────────────────────────────────

export const lighting = /* glsl */`
// Blinn-Phong lighting model
vec3 blinnPhong(
  vec3 N, vec3 V, vec3 L,
  vec3 lightColor, float lightIntensity,
  vec3 ambient, vec3 diffuse, vec3 specular, float shininess
) {
  vec3 H = normalize(L + V);
  
  // Ambient
  vec3 ambientTerm = ambient * diffuse;
  
  // Diffuse
  float diff = max(dot(N, L), 0.0);
  vec3 diffuseTerm = diff * lightColor * diffuse * lightIntensity;
  
  // Specular
  float spec = pow(max(dot(N, H), 0.0), shininess);
  vec3 specularTerm = spec * lightColor * specular * lightIntensity;
  
  return ambientTerm + diffuseTerm + specularTerm;
}

// Simple directional light
vec3 directionalLight(vec3 N, vec3 lightDir, vec3 lightColor) {
  float diff = max(dot(N, lightDir), 0.0);
  return lightColor * diff;
}

// Point light with attenuation
vec3 pointLight(vec3 N, vec3 fragPos, vec3 lightPos, vec3 lightColor, float constant, float linear, float quadratic) {
  vec3 L = lightPos - fragPos;
  float distance = length(L);
  L = normalize(L);
  
  float attenuation = 1.0 / (constant + linear * distance + quadratic * distance * distance);
  float diff = max(dot(N, L), 0.0);
  
  return lightColor * diff * attenuation;
}

// Hemisphere lighting (ambient)
vec3 hemisphereLight(vec3 N, vec3 skyColor, vec3 groundColor, vec3 upDir) {
  float blend = 0.5 + 0.5 * dot(N, upDir);
  return mix(groundColor, skyColor, blend);
}
`;

export const pbr = /* glsl */`
#define PI 3.14159265359

// Fresnel-Schlick approximation
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// With roughness
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// GGX/Trowbridge-Reitz Normal Distribution Function
float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  float denom = NdotH2 * (a2 - 1.0) + 1.0;
  return a2 / (PI * denom * denom);
}

// Geometry Schlick-GGX
float GeometrySchlickGGX(float NdotV, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;
  return NdotV / (NdotV * (1.0 - k) + k);
}

// Smith's method
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  return GeometrySchlickGGX(NdotV, roughness) * GeometrySchlickGGX(NdotL, roughness);
}

// Complete PBR lighting calculation
vec3 pbrLighting(
  vec3 N, vec3 V, vec3 L,
  vec3 albedo, float metallic, float roughness, float ao,
  vec3 lightColor, float lightIntensity
) {
  vec3 H = normalize(V + L);
  
  // F0 for dielectrics (0.04) and metals (albedo)
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, albedo, metallic);
  
  // Cook-Torrance BRDF
  float NDF = DistributionGGX(N, H, roughness);
  float G = GeometrySmith(N, V, L, roughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
  
  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
  vec3 specular = numerator / denominator;
  
  // Energy conservation
  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - metallic;  // Metals have no diffuse
  
  float NdotL = max(dot(N, L), 0.0);
  vec3 Lo = (kD * albedo / PI + specular) * lightColor * lightIntensity * NdotL;
  
  // Ambient
  vec3 ambient = vec3(0.03) * albedo * ao;
  
  return ambient + Lo;
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// 3D Math Utilities
// ─────────────────────────────────────────────────────────────────────────────

export const math3d = /* glsl */`
// Rotation matrices
mat3 rotateX(float angle) {
  float c = cos(angle), s = sin(angle);
  return mat3(1, 0, 0, 0, c, -s, 0, s, c);
}

mat3 rotateY(float angle) {
  float c = cos(angle), s = sin(angle);
  return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
}

mat3 rotateZ(float angle) {
  float c = cos(angle), s = sin(angle);
  return mat3(c, -s, 0, s, c, 0, 0, 0, 1);
}

// Axis-angle rotation
mat3 rotate(vec3 axis, float angle) {
  axis = normalize(axis);
  float c = cos(angle), s = sin(angle);
  float oc = 1.0 - c;
  return mat3(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
  );
}

// Look-at matrix (view direction)
mat3 lookAt(vec3 forward, vec3 up) {
  vec3 right = normalize(cross(up, forward));
  vec3 newUp = cross(forward, right);
  return mat3(right, newUp, forward);
}

// Camera ray from screen UV
vec3 getCameraRay(vec2 uv, vec3 camPos, vec3 target, float fov) {
  vec3 forward = normalize(target - camPos);
  vec3 right = normalize(cross(vec3(0, 1, 0), forward));
  vec3 up = cross(forward, right);
  
  float fovFactor = tan(fov * 0.5);
  return normalize(forward + right * uv.x * fovFactor + up * uv.y * fovFactor);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Normal Mapping
// ─────────────────────────────────────────────────────────────────────────────

export const normalMapping = /* glsl */`
// TBN matrix for normal mapping (requires tangent attribute)
mat3 getTBN(vec3 N, vec3 T, vec3 B) {
  return mat3(normalize(T), normalize(B), normalize(N));
}

// Derive TBN from world position and UV (no tangent attribute needed)
mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(uv);
  vec2 duv2 = dFdy(uv);
  
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  
  float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
  return mat3(T * invmax, B * invmax, N);
}

// Apply normal map
vec3 applyNormalMap(sampler2D normalMap, vec2 uv, vec3 N, vec3 V, vec3 worldPos) {
  vec3 tangentNormal = texture(normalMap, uv).xyz * 2.0 - 1.0;
  mat3 TBN = cotangentFrame(N, worldPos, uv);
  return normalize(TBN * tangentNormal);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// SDF Primitives
// ─────────────────────────────────────────────────────────────────────────────

export const sdf = /* glsl */`
// 2D SDFs
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdSegment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float sdRoundedBox(vec2 p, vec2 b, vec4 r) { r.xy = (p.x > 0.0) ? r.xy : r.zw; r.x = (p.y > 0.0) ? r.x : r.y; vec2 q = abs(p) - b + r.x; return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x; }
float sdHexagon(vec2 p, float r) { const vec3 k = vec3(-0.866025404, 0.5, 0.577350269); p = abs(p); p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy; p -= vec2(clamp(p.x, -k.z * r, k.z * r), r); return length(p) * sign(p.y); }

// 3D SDFs
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox3D(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }

// SDF Operations
float opUnion(float d1, float d2) { return min(d1, d2); }
float opSubtract(float d1, float d2) { return max(-d1, d2); }
float opIntersect(float d1, float d2) { return max(d1, d2); }
float opSmoothUnion(float d1, float d2, float k) { float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0); return mix(d2, d1, h) - k * h * (1.0 - h); }
float opSmoothSubtract(float d1, float d2, float k) { float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0); return mix(d2, -d1, h) + k * h * (1.0 - h); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Color Utilities
// ─────────────────────────────────────────────────────────────────────────────

export const color = /* glsl */`
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

// Common palettes
vec3 rainbow(float t) { return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }
vec3 sunset(float t) { return palette(t, vec3(0.5), vec3(0.5), vec3(1.0, 0.7, 0.4), vec3(0.0, 0.15, 0.2)); }
vec3 ocean(float t) { return palette(t, vec3(0.5), vec3(0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.1, 0.2)); }
vec3 fire(float t) { return palette(t, vec3(0.5, 0.2, 0.1), vec3(0.5, 0.3, 0.2), vec3(0.8, 0.4, 0.1), vec3(0.0, 0.2, 0.3)); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Tone Mapping & Post Processing
// ─────────────────────────────────────────────────────────────────────────────

export const tonemapping = /* glsl */`
vec3 aces(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 reinhard(vec3 x) { return x / (x + 1.0); }
vec3 filmic(vec3 x) { x = max(vec3(0.0), x - 0.004); return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06); }
vec3 gammaCorrect(vec3 c, float g) { return pow(c, vec3(1.0 / g)); }
vec3 vignette(vec3 c, vec2 uv, float amount) { float v = 1.0 - amount * length(uv - 0.5); return c * v; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Raymarching Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const raymarching = /* glsl */`
${sdf}

vec3 calcNormal(vec3 p, float epsilon) {
  vec2 e = vec2(epsilon, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

float raymarch(vec3 ro, vec3 rd, float maxDist, int maxSteps) {
  float t = 0.0;
  for (int i = 0; i < maxSteps; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) return t;
    if (t > maxDist) break;
    t += d;
  }
  return -1.0;
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 64; i++) {
    float h = map(ro + rd * t);
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.10);
    if (h < 0.001 || t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

float ambientOcclusion(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i) / 4.0;
    float d = map(p + h * n);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// All Utilities Combined
// ─────────────────────────────────────────────────────────────────────────────

export const all = /* glsl */`
${hash}
${noise}
${fbm}
${simplex2D}
${voronoi}
${sdf}
${color}
${tonemapping}
`;

export const GLSL = {
  hash,
  noise2D,
  noise3D,
  noise,
  simplex2D,
  fbm2D,
  fbm3D,
  fbm,
  voronoi,
  warp,
  lighting,
  pbr,
  math3d,
  normalMapping,
  sdf,
  color,
  tonemapping,
  raymarching,
  all
};

export default GLSL;
