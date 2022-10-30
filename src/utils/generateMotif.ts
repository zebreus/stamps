import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec3 } from "@jscad/modeling/src/maths/types"
import { subtract, union } from "@jscad/modeling/src/operations/booleans"
import { translate } from "@jscad/modeling/src/operations/transforms"
import { cuboid } from "@jscad/modeling/src/primitives"
//@ts-expect-error: no types available
import { extrudeSurface } from "jscad-surface"

export type MotifOptions = {
  /** url of the motif. Can be any image */
  heightMap?: { width: number; length: number; data: number[] } | undefined
  size?: Vec3
  /* Clip every value higher than this
   * a number between 0 and 1
   */
  clipTop?: number
  /* Clip every value lower than this
   * a number between 0 and 1
   */
  clipBottom?: number
}

export const generateMotif = ({
  heightMap,
  size = [40, 40, 1],
  clipBottom = 0.49,
  clipTop = 0.51,
}: MotifOptions) => {
  const data = heightMap

  if (clipBottom > clipTop) {
    throw new Error("clipBottom must be lower than clipTop")
  }

  const [width, depth, height] = size

  const clippedHeight = clipTop - clipBottom
  const unclippedHeight = height * (1 / clippedHeight)

  if (!data) {
    return undefined
  }

  const mysurface: Geom3 = translate(
    [-width / 2, depth / 2, -clipBottom * unclippedHeight],
    extrudeSurface(
      {
        scale: [
          width / data.width,
          depth / data.length,
          (1 / 256) * unclippedHeight,
        ],
        smooth: 0,
        base: 1,
      },
      data
    )
  )

  const cutCube = union(
    translate(
      [0, 0, -unclippedHeight / 2],
      cuboid({ size: [width, depth, unclippedHeight] })
    ),
    translate(
      [0, 0, unclippedHeight / 2 + (clipTop - clipBottom) * unclippedHeight],
      cuboid({ size: [width, depth, unclippedHeight] })
    )
  )

  const geometry = translate([0, 0, -height / 2], subtract(mysurface, cutCube))

  return geometry
}