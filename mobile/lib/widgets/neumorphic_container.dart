import 'package:flutter/material.dart';
import '../theme/neumorphic_theme.dart';

/// Custom Neumorphic Container supporting both Raised (Extruded)
/// and Inset (Sunken) 3D tactile aesthetics.
class NeumorphicContainer extends StatelessWidget {
  final Widget? child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final bool isInset;
  final VoidCallback? onTap;
  final Color? customBackground;
  final Border? border;
  final double depth;

  const NeumorphicContainer({
    super.key,
    this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.borderRadius = 20.0,
    this.isInset = false,
    this.onTap,
    this.customBackground,
    this.border,
    this.depth = 6.0,
  });

  @override
  Widget build(BuildContext context) {
    final bg = customBackground ?? NeumorphicThemeColors.background;

    Widget containerWidget;

    if (isInset) {
      // Sunken / Inset effect: Inner shadow simulation with subtle gradient & inner bezel
      containerWidget = Container(
        width: width,
        height: height,
        margin: margin,
        padding: padding ?? const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: border ??
              Border.all(
                color: NeumorphicThemeColors.darkShadow.withOpacity(0.5),
                width: 1.0,
              ),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              NeumorphicThemeColors.darkShadow.withOpacity(0.9),
              bg,
              NeumorphicThemeColors.lightShadow.withOpacity(0.25),
            ],
            stops: const [0.0, 0.4, 1.0],
          ),
        ),
        child: child,
      );
    } else {
      // Extruded / Raised 3D tactile effect: Dual BoxShadow (-6, -6) light, (6, 6) dark
      containerWidget = Container(
        width: width,
        height: height,
        margin: margin,
        padding: padding ?? const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: border,
          boxShadow: [
            // Top-Left Soft Lavender Light Shadow
            BoxShadow(
              color: NeumorphicThemeColors.lightShadow,
              offset: Offset(-depth, -depth),
              blurRadius: depth * 2.0,
              spreadRadius: 0,
            ),
            // Bottom-Right Midnight Dark Shadow
            BoxShadow(
              color: NeumorphicThemeColors.darkShadow,
              offset: Offset(depth, depth),
              blurRadius: depth * 2.0,
              spreadRadius: 0,
            ),
          ],
        ),
        child: child,
      );
    }

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: containerWidget,
      );
    }

    return containerWidget;
  }
}
