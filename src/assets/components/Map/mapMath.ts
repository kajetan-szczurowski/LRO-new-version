export function euclideanDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

export function feetsToMeters(feets: number){
    return  feets / 3.2808399;
}

export function hypotenuseFromPitagoras(adjoining1: number, adjoining2: number){
    return Math.sqrt(adjoining1 * adjoining1 + adjoining2 * adjoining2);
}

export function degreesToRadians(degrees: number){
    return degrees * Math.PI / 180;
}

export function radiansToDegrees(radians: number){
    return radians * 180 / Math.PI;
}

export function angleBetweenTwoPoints(cornerX: number, cornerY: number, x1: number, y1: number, x2: number, y2: number){
    //Law of Cosines
    const a = euclideanDistance(x1, y1, cornerX, cornerY);
    const b = euclideanDistance(cornerX, cornerY, x2, y2);
    const c = euclideanDistance(x1, y1, x2, y2);
    if (!a || !b || !c) return 0;
    const numerator = a * a + b * b - c * c;
    const denominator = 2 * a * b;
    const cosines = numerator / denominator;
    return Math.acos(cosines);
} 