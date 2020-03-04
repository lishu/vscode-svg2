'use strict';

exports.type = 'perItem';

exports.active = true;

exports.description = 'Sorts children of <defs> to improve compression';

/**
 * Sorts children of defs in order to improve compression.
 * Sorted first by frequency then by element name length then by element name (to ensure grouping).
 *
 * @param {Object} item current iteration item
 * @return {Boolean} if false, item will be filtered out
 *
 * @author David Leston
 */
exports.fn = function(item) {

    if (item.isElem('defs')) {

        if (item.content) {
            // Remapping for before/after comments.
            var content = [];
            var comments = [];
            var commentsList = [];
            for(var i = 0 ; i < item.content.length; i++) {
                var node = item.content[i];
                if(node.comment) {
                    comments.push(node);
                }
                else {
                    node.__nodeIndex = content.length;
                    content.push(node);
                    commentsList[node.__nodeIndex] = comments;
                    comments = [];
                }
            }

            var frequency = content.reduce(function (frequency, child) {
                if (child.elem in frequency) {
                    frequency[child.elem]++;
                } else {
                    frequency[child.elem] = 1;
                }
                return frequency;
            }, {});
            content.sort(function (a, b) {
                var frequencyComparison = frequency[b.elem] - frequency[a.elem];
                if (frequencyComparison !== 0 ) {
                    return frequencyComparison;
                }
                var lengthComparison = b.elem.length - a.elem.length;
                if (lengthComparison !== 0) {
                    return lengthComparison;
                }
                return a.elem != b.elem ? a.elem > b.elem ? -1 : 1 : 0;
            });

            item.content = [];
            for(var i=0;i<content.length;i++) {
                var node = content[i];
                item.content.push(...commentsList[node.__nodeIndex]);
                item.content.push(node);
                delete node.__nodeIndex;
            }
            if(comments && comments.length) {
                item.content.push(...comments);
            }
        }

        return true;
    }

};
