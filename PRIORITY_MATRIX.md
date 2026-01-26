# PixoSpritz Implementation Priority Matrix

**Quick Reference for Development Planning**  
**Updated**: January 26, 2026

---

## One-Page Executive Summary

### Project Status
- **Overall Progress**: 40% towards production (MVP working, needs consolidation)
- **Current Packages**: 8 functional, 2 incomplete (core-c, arm-linux)
- **Main Gaps**: Testing (15% coverage), documentation, features, platform support

### Critical Path to Production (26-34 weeks)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Consolidation (8 weeks)                             │
│ ✓ Code cleanup, standardization, testing, documentation      │
├─────────────────────────────────────────────────────────────┤
│ Phase 2: Features (8 weeks)                                  │
│ ✓ Physics, rendering optimization, scripting, mobile         │
├─────────────────────────────────────────────────────────────┤
│ Phase 3: Polish (6 weeks)                                    │
│ ✓ Performance, UX, documentation, beta release               │
├─────────────────────────────────────────────────────────────┤
│ PRODUCTION RELEASE v1.0 (Week 26-34)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Top 20 Priorities (Priority Order)

### Immediate (Weeks 1-4)
1. **[P0] Code cleanup - deprecated features** (core-js)
   - Files: patrol.js, changezone.js, dialogue.js, prompt.js
   - Effort: 3-4 days | Impact: Code quality
   
2. **[P0] Comprehensive test suite setup** (all packages)
   - Vitest configuration, CI/CD integration
   - Effort: 3 days | Impact: Foundation for testing

3. **[P0] Complete API documentation**
   - Auto-generate from JSDoc, publish online
   - Effort: 8-12 days | Impact: Adoption enabler

4. **[P0] Event system standardization** (core-js, editor)
   - menu.js, chat.js, camera.js refactoring
   - Effort: 4-5 days | Impact: Code maintainability

5. **[P1] Remove legacy shader code** (core-js)
   - pxsl/manager.js, sunset/fs.js cleanup
   - Effort: 2-3 days | Impact: Code cleanliness

### Weeks 5-12
6. **[P1] Physics system implementation** (core-js)
   - AABB collision, layers, response system
   - Effort: 5-7 days | Impact: Core gameplay feature

7. **[P1] Instanced rendering** (core-js)
   - WebGL2 instancing for particles/sprites
   - Effort: 4-5 days | Impact: 10-100x performance gain

8. **[P1] Design system migration** (editor)
   - Remove gradients, standardize CSS
   - Effort: 5-7 days | Impact: UI/UX quality

9. **[P1] PixoScript language support in editor** (editor)
   - Autocompletion, linting, Monaco integration
   - Effort: 5-7 days | Impact: Creator experience

10. **[P2] Advanced A* pathfinding** (core-js)
    - Optimize current implementation
    - Effort: 4-5 days | Impact: Gameplay quality

### Weeks 13-20
11. **[P2] Delta synchronization** (server)
    - Reduce network traffic, increase scalability
    - Effort: 5-7 days | Impact: Performance at scale

12. **[P2] Coroutines in PixoScript** (script)
    - Async/await style for game logic
    - Effort: 4-5 days | Impact: Developer experience

13. **[P2] First-time user wizard** (editor)
    - Onboarding new creators
    - Effort: 5-7 days | Impact: Adoption

14. **[P2] Mobile browser support** (console)
    - iOS Safari, Android Chrome optimization
    - Effort: 5-7 days | Impact: Market reach

15. **[P2] Unified map editor** (editor)
    - Merge 2D/3D map editors
    - Effort: 5-7 days | Impact: Developer experience

### Weeks 21-26
16. **[P3] Enhanced transition system** (core-js)
    - Wipes, pixelate, dissolve effects
    - Effort: 3 days | Impact: Polish

17. **[P3] Screen shake & smooth camera** (core-js)
    - CameraEffects system
    - Effort: 3-4 days | Impact: Feel/feedback

18. **[P3] Source maps for PixoScript** (script)
    - Error reporting with line numbers
    - Effort: 3-4 days | Impact: Developer experience

19. **[P3] Tutorial series** (website)
    - 5+ comprehensive tutorials
    - Effort: 10-15 days | Impact: Adoption

20. **[P3] Performance optimization** (core-js)
    - Frustum culling, LOD system
    - Effort: 6-8 days | Impact: Scalability

---

## Quick Decision Matrix

### Should we implement C engine + ARM platform?

| Factor | Web-Only | With Platform Support |
|--------|----------|----------------------|
| Timeline to v1.0 | 26-34 weeks | 40-50+ weeks |
| Implementation effort | 1 developer | 2-3 developers |
| Market reach | 95% | 99% |
| Development cost | $X | $3X |
| Time-to-market | 6-8 months | 10-12 months |
| Risk level | Low | High |

**Recommendation**: Ship web version first (26-34 weeks), evaluate market demand, then decide on platform expansion.

---

## Phase-by-Phase Execution

### Phase 1: Consolidation (Weeks 1-8)

**Focus**: Quality, testing, documentation

| Task | Effort | Assigned | Status |
|------|--------|----------|--------|
| Deprecated code cleanup | 3-4d | - | Not started |
| Test infrastructure | 3d | - | Not started |
| API documentation | 8-12d | - | Not started |
| Event system refactor | 4-5d | - | Not started |
| Design system migration | 5-7d | - | Not started |
| Server cleanup | 3-4d | - | Not started |
| PixoScript stdlib fixes | 4-5d | - | Not started |

**Subtotal**: 30-40 days effort
**With contingency**: 8-10 weeks

---

### Phase 2: Features (Weeks 9-16)

**Focus**: Gameplay systems, developer experience, market reach

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Physics system | 5-7d | P1 | Not started |
| Instanced rendering | 4-5d | P1 | Not started |
| A* pathfinding | 4-5d | P2 | Not started |
| PixoScript support (editor) | 5-7d | P1 | Not started |
| Coroutines | 4-5d | P2 | Not started |
| Mobile support | 5-7d | P1 | Not started |
| Unified map editor | 5-7d | P2 | Not started |
| Delta sync (server) | 5-7d | P2 | Not started |

**Subtotal**: 37-50 days effort
**With contingency**: 8-10 weeks

---

### Phase 3: Polish (Weeks 17-22)

**Focus**: Performance, UX, documentation, beta

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Performance optimization | 6-8d | P2 | Not started |
| Transition system | 3d | P3 | Not started |
| Camera effects | 3-4d | P3 | Not started |
| Source maps | 3-4d | P2 | Not started |
| Tutorials | 10-15d | P1 | Not started |
| Website content | 8-12d | P2 | Not started |
| Bug fixes & polish | 8d | - | Not started |

**Subtotal**: 41-50 days effort
**With contingency**: 6-8 weeks

---

## Package Maturity Levels

```
Maturity Scale: ⛔ Design | 🔴 Incomplete | 🟡 Functional | 🟢 Complete | 🌟 Production-Ready

core-js:       🟡 Functional (needs features + testing)
editor:        🟡 Functional (needs polish + features)
console:       🟡 Functional (mobile needs work)
server:        🟡 Functional (delta sync pending)
script:        🟡 Functional (incomplete features)
math:          🟢 Complete (minor enhancements)
specs:         🟢 Complete (good foundation)
website:       🟡 Functional (needs content)
spritz:        🟢 Complete (excellent example)
core-c:        🔴 Incomplete (not started)
arm-linux:     🔴 Incomplete (design phase)
```

---

## Testing Progress Tracker

```
Current Coverage:    ████░░░░░░░░░░░░░░░░░  15%
Phase 1 Target:      ██████████░░░░░░░░░░░░  50%
Phase 2 Target:      ████████████░░░░░░░░░░  60%
Phase 3 Target:      ██████████████░░░░░░░░  70%
Production Target:   █████████████████░░░░░  80%+
```

### Test Coverage by Package

| Package | Current | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|---------|
| core-js | 20% | 50% | 70% | 80% |
| editor | 5% | 30% | 50% | 60% |
| console | 10% | 40% | 60% | 70% |
| server | 15% | 50% | 70% | 80% |
| script | 20% | 60% | 75% | 85% |
| math | 40% | 80% | 90% | 95% |
| **Overall** | **15%** | **48%** | **65%** | **75%** |

---

## Feature Completion Matrix

### By Component & Phase

```
CORE ENGINE (core-js)
├─ Rendering [████████░░] 80% - needs instancing, LOD
├─ Physics [░░░░░░░░░░] 0% - P1 feature, 5-7 days
├─ Pathfinding [██████░░░░] 60% - needs A* optimization
├─ Scripting [██████████] 100% - works via pixoscript
├─ Audio [████████░░] 80% - needs enhancement
└─ Event System [████░░░░░░] 40% - needs refactoring

EDITOR (editor)
├─ Sprite tools [██████████] 100%
├─ Tile tools [██████████] 100%
├─ Map tools [████████░░] 80% - needs 2D/3D unification
├─ Cutscene tools [████████░░] 80%
├─ Model viewer [████████░░] 80% - needs ResourceManager integration
└─ Script editor [██████░░░░] 60% - needs PixoScript support

CONSOLE (console)
├─ Game loading [████████░░] 80%
├─ Rendering [████████░░] 80%
├─ Input [██████░░░░] 60% - mobile gaps
├─ Audio [████████░░] 80%
└─ Fullscreen [███████░░░] 70% - mobile issues

SERVER (server)
├─ WebSocket API [████████░░] 80%
├─ Zone management [████████░░] 80%
├─ Session mgmt [████████░░] 80%
├─ Auth & security [████████░░] 80% - done
└─ Optimization [████░░░░░░] 40% - needs delta sync

SCRIPT ENGINE (pixoscript)
├─ Parser [████████░░] 80%
├─ Runtime [████████░░] 80%
├─ Standard library [██████░░░░] 60% - incomplete math/string/os
├─ Coroutines [░░░░░░░░░░] 0% - P2 feature
└─ Debug support [░░░░░░░░░░] 0% - P3 feature
```

---

## Known Issues & Blockers

### Critical (Must Fix for v1.0)
1. **No physics system** - Blocks gameplay features
   - Impact: Can't build collision-based games
   - Fix effort: 5-7 days
   - Status: Planned Phase 2

2. **Low test coverage** - Risks stability
   - Impact: Bugs in production
   - Fix effort: 30-34 days
   - Status: Phase 1 priority

### Important (Should Fix)
3. **Mobile input problems** - Limits market reach
   - Impact: Poor mobile experience
   - Fix effort: 5-7 days
   - Status: Phase 2

4. **Missing documentation** - Adoption blocker
   - Impact: Hard for new creators
   - Fix effort: 8-15 days
   - Status: Phase 1

5. **No performance optimization** - Scalability concerns
   - Impact: Can't handle complex scenes
   - Fix effort: 6-8 days
   - Status: Phase 3

### Nice-to-Have (Polish)
6. **ARM platform incomplete** - Niche market
7. **No advanced scripting features** - Power users
8. **Limited asset formats** - Creator flexibility

---

## Success Metrics by Phase

### Phase 1 Completion Criteria
- [ ] 50%+ test coverage
- [ ] All PENDING/CLEANUP items addressed
- [ ] Complete API documentation published
- [ ] Zero critical bugs
- [ ] All packages follow same code standards
- [ ] No deprecated code in production

### Phase 2 Completion Criteria
- [ ] 65%+ test coverage
- [ ] Physics system functional
- [ ] All planned features implemented
- [ ] Mobile support working
- [ ] PixoScript editor integration complete
- [ ] Server handles 100+ concurrent players

### Phase 3 Completion Criteria
- [ ] 75%+ test coverage
- [ ] Performance benchmarks met
- [ ] Tutorial series complete
- [ ] 50+ beta testers feedback incorporated
- [ ] Marketing website complete
- [ ] Ready for v1.0 release

---

## Resource Planning

### Timeline Comparison

```
SCENARIO 1: 1 Developer (Current)
├─ Phase 1: 8-10 weeks
├─ Phase 2: 8-10 weeks
├─ Phase 3: 6-8 weeks
└─ Total: 22-28 weeks → 6-7 months to v1.0

SCENARIO 2: 2 Developers (Recommended)
├─ Phase 1: 5-6 weeks (parallel work)
├─ Phase 2: 5-6 weeks (parallel work)
├─ Phase 3: 4-5 weeks (parallel work)
└─ Total: 14-17 weeks → 3.5-4 months to v1.0

SCENARIO 3: 3 Developers (Ideal)
├─ Phase 1: 4-5 weeks (high parallelism)
├─ Phase 2: 4-5 weeks (high parallelism)
├─ Phase 3: 3-4 weeks (parallel work)
└─ Total: 11-14 weeks → 2.5-3.5 months to v1.0
```

**Current**: 1 developer (Kyle Derby MacInnis)

---

## Budget Estimation

### Development Costs (Salary basis)

```
Assuming $80k/year developer salary = $38/hour

SCENARIO 1: 1 Developer, 26-34 weeks
├─ Effort: 1,040-1,360 hours
├─ Cost: $39,520-$51,680
└─ Timeline: 6-8 months

SCENARIO 2: 2 Developers, 14-17 weeks (parallel)
├─ Effort: 1,120-1,360 hours (total)
├─ Cost: $42,560-$51,680
└─ Timeline: 3.5-4 months

SCENARIO 3: 3 Developers, 11-14 weeks (parallel)
├─ Effort: 1,320-1,680 hours (total)
├─ Cost: $50,160-$63,840
└─ Timeline: 2.5-3.5 months
```

### Hosting & Infrastructure
- Server hosting: $50-200/month
- CDN (Netlify): $19-99/month
- Domain: $12/year
- **Total**: ~$300-400/month ongoing

---

## Rollout Strategy

### Beta Phase (Week 24-26)
- [ ] Soft launch to 50 beta testers
- [ ] Gather feedback on UX, performance, features
- [ ] Fix bugs discovered
- [ ] Update documentation based on feedback
- [ ] Setup community channels (Discord, Forum)

### v1.0 Release (Week 26-34)
- [ ] Public launch
- [ ] Marketing push (Twitter, Reddit, Game Dev communities)
- [ ] Press releases to game dev publications
- [ ] First tutorial video series launch
- [ ] Community game jam announcement

### Post-Release (Month 9+)
- [ ] Monthly updates with new features
- [ ] Asset store launch planning
- [ ] Platform expansion (mobile, desktop, ARM)
- [ ] Advanced feature development
- [ ] Community ecosystem growth

---

## Quick Implementation Checklist

### START HERE (This Week)
- [ ] Review this roadmap with team
- [ ] Create GitHub projects for Phase 1-3
- [ ] Set up test infrastructure (Vitest)
- [ ] Begin deprecated code cleanup
- [ ] Start Phase 1 documentation

### PHASE 1 (Weeks 1-8)
- [ ] Complete code cleanup
- [ ] Achieve 50%+ test coverage
- [ ] Publish API documentation
- [ ] Refactor event systems
- [ ] Migrate design system
- [ ] Fix server cleanup

### PHASE 2 (Weeks 9-16)
- [ ] Implement physics system
- [ ] Add instanced rendering
- [ ] Complete PixoScript editor support
- [ ] Improve mobile support
- [ ] Add coroutines
- [ ] Implement delta sync

### PHASE 3 (Weeks 17-22)
- [ ] Performance optimization
- [ ] Enhanced transitions
- [ ] Source maps
- [ ] Tutorial videos
- [ ] Website content
- [ ] Beta testing

### LAUNCH (Week 26+)
- [ ] v1.0 Release
- [ ] Marketing campaign
- [ ] Community launch
- [ ] Post-release support

---

## Communication & Tracking

### Weekly Standup Agenda
1. Progress on current phase priorities
2. Blockers and challenges
3. Test coverage update
4. Next week's focus
5. Any scope changes needed

### Monthly Review
1. Phase progress vs. estimates
2. Risk assessment
3. Community feedback
4. Roadmap adjustments if needed
5. Release readiness assessment

### Metrics to Track
- Code coverage % (target: 80%+)
- Lines of deprecated code (target: 0%)
- GitHub issues (target: <20 open)
- Performance benchmarks (target: 60fps minimum)
- Community engagement (Discord members, GitHub stars)

---

## Resources & References

### Key Documents in This Repo
- `PROJECT_COMPLETION_ROADMAP.md` - Detailed phase breakdown
- `PENDING.md` (each package) - Feature lists
- `CLEANUP.md` (each package) - Code quality tasks
- `AUDIT_REPORT.md` (core-js) - Architecture review
- `MISSING_FEATURES_PLANNING.md` (core-js) - Feature deep-dives

### External Resources
- Vitest docs: https://vitest.dev
- TypeDoc: https://typedoc.org
- WebGL2 specs: https://www.khronos.org/webgl/
- Lua docs: https://www.lua.org/manual/
- Buildroot: https://buildroot.org (for ARM)

### Community
- Discord: TBD
- GitHub: https://github.com/ConflictingTheories/calliope-pixos
- Website: https://pixospritz.com
- Twitter: TBD

---

**Version**: 1.0  
**Date**: January 26, 2026  
**Status**: Ready for implementation  
**Next Review**: End of Week 4 (Phase 1)
