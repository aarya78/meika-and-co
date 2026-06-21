
import { CollectionCard } from './CollectionCard'

function CollectionSection() {
    return (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <CollectionCard
                title="Mini Buddies"
                description="Tiny handmade companions."
                image="/collections/mini-buddies.jpg"
            />

            <CollectionCard
                title="Sleep Dino Collection"
                description="Soft sleepy dinosaurs."
                image="/collections/dino.jpg"
            />

            <CollectionCard
                title="Lazy Jungle Series"
                description="Adorable jungle animals."
                image="/collections/jungle.jpg"
            />

            <CollectionCard
                title="Custom Dolls"
                description="Personalized handmade dolls."
                image="/collections/custom.jpg"
            />
        </div>
    )
}

export default CollectionSection
