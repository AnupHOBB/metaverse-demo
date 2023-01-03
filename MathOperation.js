import { Vector3 } from 'three'

export function addVectors(v1, v2)
{
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
}

export function subtractVectors(v1, v2)
{
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
}

export function normalize(v)
{
    let len = length(v)
    return new Vector3(v.x/len, v.y/len, v.z/len)
}

export function length(v)
{
    return Math.sqrt((v.x * v.x)+(v.y * v.y)+(v.z * v.z))
}

export function angleInRadians(v1, v2)
{
    let v1_normal = normalize(v1)
    let v2_normal = normalize(v2)
    let cosine = (v1_normal.x * v2_normal.x) + (v1_normal.y * v2_normal.y) + (v1_normal.z * v2_normal.z)
    return Math.acos(cosine)
}

export function cross(v1, v2)
{
    return normalize(new Vector3(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x))
}

export function toRadians(degrees)
{
    return (degrees * 22) / (7 * 180)
}

export function isVector3Equal(v1, v2)
{
    return isFloatEqual(v1.x, v2.x) && isFloatEqual(v1.y, v2.y) && isFloatEqual(v1.z, v2.z)
}

export function isFloatEqual(f1, f2)
{
    let diff = (f1 > f2) ? f1 - f2 : f2 - f1
    return diff < 0.00001
}