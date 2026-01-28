# Paper Shaders

> **⚠️ IMPORTANT LICENSE NOTICE:**  
> This is a fork of the original [Paper Shaders](https://github.com/paper-design/shaders) by [Lost Coast Labs](http://paper.design).  
> 
> **The original project uses the PolyForm Shield License which contains a Noncompete clause.**  
> Publishing this fork to npm may violate the license terms. See [LICENSE COMPLIANCE](#license-compliance) below for details.

> **Note:** This fork adds support for Display P3 color space and modern CSS color formats (OkLab, OkLCH) while maintaining compatibility with the original project.

![mesh-gradient-shader](./docs/public/images/git-readme-picture.webp)

## About This Fork

This fork extends the original Paper Shaders with:
- ✨ **Display P3 Color Space Support**: Automatic detection and use of wide color gamut on supported displays
- 🎨 **Modern CSS Color Formats**: Support for `oklab()`, `oklch()`, and `color(display-p3)` color functions
- 📦 **Culori Integration**: Using the well-tested [culori](https://culorijs.org/) library for robust color conversions

All original features and shader components are preserved. This fork is published under the `@pumpn` npm scope.

### Getting started

```
// React
npm i @pumpn/shaders-react

// vanilla
npm i @pumpn/shaders

// Please pin your dependency – we will ship breaking changes under 0.x.x versioning
```

### Documentation

[React documentation and interactive examples →](https://shaders.paper.design/)

### React example

```jsx
import {MeshGradient, DotOrbit} from '@pumpn/shaders-react';

<MeshGradient
    colors={['#5100ff', '#00ff80', '#ffcc00', '#ea00ff']}
    distortion={1}
    swirl={0.8}
    speed={0.2}
    style={{width: 200, height: 200}}
/>

<DotOrbit
    colors={['#d2822d', '#0c3b7e', '#b31a57', '#37a066']}
    colorBack={'#000000'}
    scale={0.3}
    style={{width: 200, height: 200}}
/>

// these settings can be configured in code or designed in Paper
```

### Goals:

- Give designers a visual way to use common shaders in their designs
- What you make is directly exportable as lightweight code that works in any codebase

### What it is:

- Zero-dependency HTML canvas shaders that can be installed from npm or designed in Paper
- To be used in websites to add texture as backgrounds or masked with shapes and text
- Animated (or not, your choice) and highly customizable

### Values:

- Very lightweight, maximum performance
- Visual quality
- Abstractions that are easy to play with
- Wide browser and device support

### Framework support:

- Vanilla JS ([@pumpn/shaders](https://www.npmjs.com/package/@pumpn/shaders))
- React JS ([@pumpn/shaders-react](https://www.npmjs.com/package/@pumpn/shaders-react))
- Vue and others: intent to accept community PRs in the future

## Release notes

[View changelog →](./CHANGELOG.md)

## Building and publishing

1. Bump the version numbers as desired manually
2. Use `bun run build` on the top level of the monorepo to build each package
3. Use `bun run publish-all` to publish all (or `bun run publish-all-test` to do a dry run). You can do this even if you just bumped one package version. The others will fail to publish and continue.

## License Compliance

### ⚠️ Critical: Noncompete Clause

The original Paper Shaders project uses the **PolyForm Shield License 1.0.0**, which includes a **Noncompete clause** (see LICENSE file, lines 52-56):

> "Any purpose is a permitted purpose, except for providing any product that competes with the software or any product the licensor or any of its affiliates provides using the software."

### What This Means for Publishing

**Publishing this fork to npm as `@pumpn/shaders` may violate the license** because:

1. It provides the same functionality as the original packages
2. It can be used as a drop-in replacement
3. The license defines "compete" broadly - even free libraries compete with each other
4. The license explicitly states: "If you market a product as a practical substitute for the software...it definitely competes"

### Recommended Actions

**Before publishing to npm, you should:**

1. **Contact Lost Coast Labs** for explicit written permission
   - Website: http://paper.design
   - Original repo: https://github.com/paper-design/shaders

2. **OR: Contribute back to the original project**
   - Submit PRs with Display P3 support
   - Submit PRs with OkLab/OkLCH support
   - This benefits everyone and avoids license conflicts

3. **Private/Internal use IS allowed:**
   - Using this fork in your own projects ✅
   - Using it in your company's internal projects ✅
   - Modifying and extending for personal use ✅

### What the License DOES Allow

✅ Use the software  
✅ Make modifications  
✅ Create derivative works  
✅ Use in your own projects (non-competing)  

### What the License PROHIBITS

❌ Publishing competing products to npm  
❌ Marketing as an alternative to Paper Shaders  
❌ Providing it as a service that competes  

**For full license details, see the [LICENSE](./LICENSE) file.**

## License and use

Paper Shaders uses the PolyForm Shield license. This means the code is free to use in any commercial or non-commercial apps, products, and libraries, as long as they do not compete with Paper or Paper Shaders.

You may NOT use this code in library or in a design tool that competes with Paper or Paper Shaders.

We ask that you link to Paper Shaders if you use this code (it helps us continue investing in this project). Thank you!

[Read the full license →](./LICENSE)

Required Notice: Copyright Lost Coast Labs, Inc. (http://paper.design)

---

## Attribution

This fork is based on [Paper Shaders](https://github.com/paper-design/shaders) by Lost Coast Labs, Inc.

**Original Project**: https://github.com/paper-design/shaders  
**Original Documentation**: https://shaders.paper.design/  
**Original License**: PolyForm Shield License

Additional features and modifications in this fork are maintained by the [@pumpn](https://github.com/nnmrts/shaders) community.
