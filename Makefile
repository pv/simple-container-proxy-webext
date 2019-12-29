PACKAGE=simple_container_proxy
VERSION=$(shell cat src/manifest.json | jq .version | sed -e 's/^"//; s/"$$//;')
SOURCES=$(shell find src -type f)

ZIPNAME=$(PACKAGE)-$(VERSION).zip

zip: $(ZIPNAME)

clean:
	rm -f $(ZIPNAME)

$(ZIPNAME): $(SOURCES)
	cd src && zip -9r -x '*~' @ ../$@ *

.PHONY: clean zip
